import { NextFunction, Request, Response } from "express";
import { Activity } from "../models/Activity";
import { logger } from "../utils/logger";

// Controller to log a new activity
export const logActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, name, description, duration, difficulty, feedback } =
      req.body;

    // Get user ID from authenticated request
    const userId = req.user?._id;

    // Ensure user is authenticated
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Create a new activity document using the data from the request body and the authenticated user ID
    const activity = new Activity({
      userId,
      type,
      name,
      description,
      duration,
      difficulty,
      feedback,
      timestamp: new Date(),
    });

    await activity.save(); // Save the new activity to the database
    logger.info(`Activity logged for user ${userId}`);

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error); // Pass errors to the error handling middleware
  }
};

// Controller to get all activities logged today for the authenticated user
export const getTodayActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Calculate the start and end of the current day
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today (00:00:00.000)

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    // Find activities for the user within the time range
    const todayActivities = await Activity.find({
      userId,
      timestamp: {
        $gte: today, // Greater than or equal to the start of today
        $lt: tomorrow, // Less than the start of tomorrow
      },
    }).sort({ timestamp: -1 }); // Sort by newest first

    logger.info(
      `Fetched ${todayActivities.length} activities for user ${userId} today`
    );

    res.json(todayActivities);
  } catch (error) {
    next(error);
  }
};
