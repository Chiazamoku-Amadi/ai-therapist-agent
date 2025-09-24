import express from "express";
import { auth } from "../middleware/auth";
import { createMood } from "../controllers/moodController";

// Create a new router for mood-related routes
const router = express.Router();

// Protect all routes in this router with authentication middleware
router.use(auth);

// Track a new mood entry
router.post("/", createMood);

export default router;
