import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

// Allows us to create custom error classes that extend the standard Error class
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    // Capture the stack trace for better error debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Log unexpected errors
  logger.error("Unexpected error:", err);

  // For unexpected errors, send a generic message to the client
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};
