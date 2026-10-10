import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/User";
import { JWT_SECRET } from "../config/env";

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

    // Verify token and extract user ID
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

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
