import mongoose from "mongoose";
import { logger } from "./logger";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://Chiazamoku:BtNCJeyHzl5Q1Sab@ai-therapist-agent.ykwdqrs.mongodb.net/?retryWrites=true&w=majority&appName=ai-therapist-agent";

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
