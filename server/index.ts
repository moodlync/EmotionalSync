import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import * as http from 'http';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for all routes
app.use(cors({
  origin: true, // Allow any origin
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add headers for Replit compatibility
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Global variables to track the server state
  let boundPort: number | null = null;
  let websocketInitialized = false;
  
  // Simplify port binding - always use port 5000 for Replit compatibility
  const port = 5000;
  
  // Simple direct server listen approach
  log(`Starting MoodLync server on port ${port}...`);
  
  // Listen on all interfaces (0.0.0.0) to make the server accessible 
  // from both localhost and remote connections
  server.listen(port, "0.0.0.0", () => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : port;
    
    boundPort = actualPort;
    log(`MoodLync server running on port ${actualPort}`);
  
    // Initialize WebSocket only once
    if (!websocketInitialized) {
      // @ts-ignore - Access dynamically exported function
      const initializeWebSocketServer = server['initializeWebSocketServer'];
      if (typeof initializeWebSocketServer === 'function') {
        try {
          initializeWebSocketServer();
          websocketInitialized = true;
          log(`WebSocket server initialized on port ${actualPort}`);
        } catch (error) {
          console.error('Failed to initialize WebSocket server:', error);
        }
      } else {
        console.warn('WebSocket server initialization function not found');
      }
    }
  }).on('error', (err: any) => {
    console.error(`Failed to start server on port ${port}:`, err.message);
    console.error(`Server initialization failed. Please check if port ${port} is already in use.`);
  });
})();
