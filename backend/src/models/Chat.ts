/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Document, Schema, Types } from "mongoose";

// This interface defines the structure of a single message within a chat session
export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    analysis?: any;
    currentGoal?: string | null;
    progress?: {
      emotionalState?: string;
      riskLevel?: number;
    };
  };
}

// This interface defines the structure of a complete chat session document
// It extends mongoose document to get mongoose properties
export interface IChatSession extends Document {
  _id: Types.ObjectId;
  sessionId: string;
  userId: Types.ObjectId;
  startTime: Date;
  status: "active" | "completed" | "archived";
  messages: IChatMessage[];
}

// Mongoose schema for individual chat messages
const chatMessageSchema = new Schema<IChatMessage>({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    technique: String,
    goal: String,
    progress: [Schema.Types.Mixed],
  },
});

// Mongoose schema for chat sessions
const chatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    status: {
      type: String,
      required: true,
      enum: ["active", "completed", "archived"],
    },
    messages: [chatMessageSchema],
  },
  {
    timestamps: true,
  }
);

// Mongoose model for ChatSession
export const ChatSession = mongoose.model<IChatSession>(
  "ChatSession",
  chatSessionSchema
);
