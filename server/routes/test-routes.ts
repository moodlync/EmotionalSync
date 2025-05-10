import express from 'express';
import { z } from 'zod';

// Create a router
const router = express.Router();

// Test endpoint for debugging registration issues
router.post("/test-register", async (req, res) => {
  try {
    console.log("[DEBUG] Test registration request received:", {
      username: req.body.username,
      email: req.body.email,
      hasPassword: !!req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    });
    
    // Validate required fields
    if (!req.body.username) {
      return res.status(400).json({ error: "Username is required" });
    }
    
    if (!req.body.password) {
      return res.status(400).json({ error: "Password is required" });
    }
    
    // Password validation
    if (req.body.password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    
    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(req.body.username)) {
      return res.status(400).json({ error: "Username can only contain letters, numbers, underscores and hyphens" });
    }
    
    // Email validation if provided
    if (req.body.email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(req.body.email)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
    }
    
    // All validations passed
    res.status(200).json({
      success: true,
      message: "Test registration validation passed", 
      validatedData: {
        ...req.body,
        password: "********" // Mask password in response
      }
    });
  } catch (error) {
    console.error("[DEBUG] Test registration error:", error);
    res.status(500).json({ 
      success: false,
      error: "Test registration processing error",
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Health check endpoint
router.get("/healthcheck", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;