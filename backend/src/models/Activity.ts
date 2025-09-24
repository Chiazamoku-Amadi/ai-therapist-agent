import mongoose, { Document, Schema } from "mongoose";

// Activity interface extending Mongoose Document
export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  name: string;
  description?: string;
  duration?: number;
  timestamp: Date;
}

// Mongoose schema for Activity
const activitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "meditation",
        "exercise",
        "walking",
        "reading",
        "journaling",
        "therapy",
      ],
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: Number,
      min: 0,
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

// Compound index to optimize queries by userId and timestamp
// With this, any db queries that first filter by userId and then sort by timestamp in desc. order (showing the most recent activities first) will be executed very efficiently
activitySchema.index({ userId: 1, timestamp: -1 });

// Mongoose model for Activity
export const Activity = mongoose.model<IActivity>("Activity", activitySchema);
