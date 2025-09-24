import express from "express";
import { auth } from "../middleware/auth";
import {
  createChatSession,
  getAllChatSessions,
  getChatHistory,
  getChatSession,
  sendMessage,
} from "../controllers/chat";

const router = express.Router();

// Protect all routes in this router with authentication middleware
router.use(auth);

// Create a new chat session - POST /chat/sessions
router.post("/sessions", createChatSession);

// Get all chat sessions for the user - GET /chat/sessions
router.get("/sessions", getAllChatSessions);

// Get a specific chat session - GET /chat/sessions/:sessionId
router.get("/sessions/:sessionId", getChatSession);

// Send a message in a chat session - POST /chat/sessions/:sessionId/messages
router.post("/sessions/:sessionId/messages", sendMessage);

// Get chat history for a session - GET /chat/sessions/:sessionId/history
router.get("/sessions/:sessionId/history", getChatHistory);

export default router;
