import { inngest } from "./client";
import {
  analyzeTherapySession,
  generateActivityRecommendations,
  processChatMessage,
} from "./aiFunctions";
import {
  activityCompletionHandler,
  moodTrackingHandler,
  therapySessionHandler,
} from "./functions";

// Create an empty array where we'll export future Inngest functions
export const functions = [
  processChatMessage,
  analyzeTherapySession,
  generateActivityRecommendations,
  therapySessionHandler,
  moodTrackingHandler,
  activityCompletionHandler,
];

export { inngest };
