import mongoose, { Document, Schema } from "mongoose";

// Session interface extending Mongoose Document
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  deviceInfo?: string;
  lastActive: Date;
}

// Mongoose schema for Session
const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    deviceInfo: { type: String },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// TTL (Time To Live) index on expiresAt for automatic cleanup of expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mongoose model for Session
export const Session = mongoose.model<ISession>("Session", SessionSchema);
