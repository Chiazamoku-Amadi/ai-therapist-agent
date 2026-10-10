import mongoose from "mongoose";
import { logger } from "./logger";
import { MONGODB_URI } from "../config/env";

// Function to connect to MongoDB Atlas using Mongoose
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB Atlas");
  } catch (error) {
    logger.info("MongoDB connection error:", error);
    process.exit(1);
  }
};
