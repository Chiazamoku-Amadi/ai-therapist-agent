import { Router } from "express";
import { login, logout, register } from "../controllers/authController";
import { auth } from "../middleware/auth";

const router = Router();

// Register a new user - POST /auth/register
router.post("/register", register);

// User login - POST /auth/login
router.post("/login", login);

// User logout - POST /auth/logout
router.post("/logout", auth, logout);

// Get current authenticated user - GET /auth/me
router.get("/me", auth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
