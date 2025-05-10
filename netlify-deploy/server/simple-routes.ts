import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupSimplifiedAuth } from "./simplified-auth";

export async function registerSimpleRoutes(app: Express): Promise<Server> {
  // Initialize our simplified authentication BEFORE registering any routes
  setupSimplifiedAuth(app);
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Add basic WebSocket support
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
      
      // Echo back the message
      ws.send(JSON.stringify({
        type: 'echo',
        message: message.toString(),
        timestamp: new Date().toISOString()
      }));
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      message: 'Connected to MoodLync simplified WebSocket server',
      timestamp: new Date().toISOString()
    }));
  });
  
  return httpServer;
}