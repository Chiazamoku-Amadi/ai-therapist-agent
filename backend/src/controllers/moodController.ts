import { NextFunction, Request, Response } from "express";
import { Mood } from "../models/Mood";
import { logger } from "../utils/logger";

export const createMood = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { score, note, context, activities } = req.body;

    // Get user ID from authenticated request
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Create a new mood document using the data from the request body and the authenticated user ID
    const mood = new Mood({
      userId,
      score,
      note,
      context,
      activities,
      timestamp: new Date(),
    });

    await mood.save(); // Save the new mood entry to the database
    logger.info(`Mood logged for user ${userId}`);

    res.status(201).json({
      success: true,
      data: mood,
    });
  } catch (error) {
    next(error); // Pass errors to the error handling middleware
  }
};
