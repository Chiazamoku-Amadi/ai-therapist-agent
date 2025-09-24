import mongoose, { Document, Schema } from "mongoose";

// Mood interface extending Mongoose Document
// It defines the properties for a mood entry
export interface IMood extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  note?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for Mood
const moodSchema = new Schema<IMood>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    note: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize queries by userId and timestamp for a user's mood entries
// With this, any db queries that first filter by userId and then sort by timestamp in desc. order (showing the most recent activities first) will be executed very efficiently
moodSchema.index({ userId: 1, timestamp: -1 });

// Mongoose model for Mood
export const Mood = mongoose.model<IMood>("Mood", moodSchema);
