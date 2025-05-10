/**
 * Modified auth.ts - Authentication removed
 * This file now provides alternative implementations for endpoints
 * that previously required authentication
 */

import { Express } from "express";

// Default user data used for API endpoints that need to return user info
const defaultUser = {
  id: 1,
  username: "moodlync_user",
  email: "user@example.com",
  firstName: "Default",
  lastName: "User", 
  role: "user",
  isActive: true,
  createdAt: new Date().toISOString(),
  profilePicture: "/assets/default-avatar.png",
  mood: "happy",
  tokens: 500,
  isPremium: true
};

/**
 * Setup routes that previously required authentication
 * Each route now returns a predefined response without requiring login
 */
export function setupAuth(app: Express) {
  console.log("Setting up modified auth routes (no authentication required)");
  
  // Endpoint that previously handled registration - now just returns success
  app.post("/api/register", (req, res) => {
    console.log("Registration endpoint called - returning mock data");
    
    // Return success response with default user
    res.status(200).json(defaultUser);
  });

  // Endpoint that previously handled login - now just returns success
  app.post("/api/login", (req, res) => {
    console.log("Login endpoint called - returning mock data");
    
    // Return success response with default user
    res.status(200).json(defaultUser);
  });

  // Endpoint that previously handled logout - now just returns success
  app.post("/api/logout", (req, res) => {
    console.log("Logout endpoint called");
    res.status(200).json({ success: true });
  });

  // Endpoint that previously returned authenticated user data
  app.get("/api/user", (req, res) => {
    console.log("User profile endpoint called - returning mock data");
    res.status(200).json(defaultUser);
  });
  
  // Health check endpoint
  app.get("/api/healthcheck", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      authStatus: "No authentication required"
    });
  });
  
  // Mock user search endpoint
  app.get("/api/users/search", (req, res) => {
    console.log("User search endpoint called - returning mock data");
    
    // Create an array of mock users
    const mockUsers = [
      {
        id: 2,
        username: "jane_doe",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        profilePicture: "/assets/default-avatar.png"
      },
      {
        id: 3,
        username: "john_smith",
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        profilePicture: "/assets/default-avatar.png"
      }
    ];
    
    res.status(200).json(mockUsers);
  });
}
