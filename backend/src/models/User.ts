import mongoose, { Document, Schema } from "mongoose";

// User interface extending Mongoose Document
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

// Mongoose schema for User
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Mongoose model for User
export const User = mongoose.model<IUser>("User", UserSchema);
