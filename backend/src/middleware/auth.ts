import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/User";

// Extend Express Request interface using module augmentation
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
  }
}

// Define interface for the decoded JWT payload
interface JwtPayload {
  userId: string;
  iat?: number; // issued at
  exp?: number; // expiration time
}

// Authentication middleware to protect routes
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Check if the JWT secret is defined before using it.
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return res.status(500).json({ message: "Server configuration error." });
    }

    // Verify token and extract user ID
    // Cast the secret to a string because you've already checked for its existence
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Find the user by ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // Attach user to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Invalid authentication token", error });
  }
};
