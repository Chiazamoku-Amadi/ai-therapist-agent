import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

import express from "express";
import { serve } from "inngest/express";
import { inngest } from "./inngest";
import { functions as inngestFunctions } from "./inngest/index";
import { logger } from "./utils/logger";
import { connectDB } from "./utils/db";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth";
import chatRouter from "./routes/chat";
import moodRouter from "./routes/mood";
import activityRouter from "./routes/activity";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Middlewares
// Enable CORS(Cross Origin Resource Sharing) for all incoming requests
app.use(
  cors({
    origin: [
      "https://ai-therapist-agent-mea.vercel.app",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Security middleware to set various HTTP headers for app security
app.use(helmet());

// HTTP request logger middleware
app.use(morgan("dev"));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve Inngest functions at the /api/inngest endpoint
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions })
);

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRouter);
app.use("/api/mood", moodRouter);
app.use("/api/activity", activityRouter);

// Error handling middleware (should be the last middleware)
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(
        `Inngest endpoint available at http://localhost:${PORT}/api/inngest`
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
