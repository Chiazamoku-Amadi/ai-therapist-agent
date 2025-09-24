import express from "express";
import { auth } from "../middleware/auth";
import {
  getTodayActivities,
  logActivity,
} from "../controllers/activityController";

// Create a new router for activity-related routes
const router = express.Router();

// Protect all routes in this router with authentication middleware
router.use(auth);

// Log a new activity - POST /api/activity/log
router.post("/", logActivity);

// Get today's activities - GET /api/activity/today
router.get("/today", getTodayActivities);

export default router;
