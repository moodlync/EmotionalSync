import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import * as http from 'http';
import { createServer } from 'http';

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

  // Note: Vite setup will be done later in the code
  // This helps prevent duplicate setup

  // Global variables to track the server state
  let websocketInitialized = false;

  // Determine which ports to try based on environment
  const isReplitEnv = !!(process.env.REPL_ID || process.env.REPL_SLUG);

  // Switch back to port 5000 for Replit compatibility
  const primaryPort = 5000;
  
  // Keep the workflow port the same
  const workflowPort = 5000;

  // Simple direct server listen approach
  log(`Starting MoodLync server on port ${primaryPort}...`);

  // Create a function to initialize WebSocket server
  const initializeWebSocketIfNeeded = (server: http.Server) => {
    if (websocketInitialized) return;

    // @ts-ignore - Access dynamically exported function
    const initializeWebSocketServer = server['initializeWebSocketServer'];
    if (typeof initializeWebSocketServer === 'function') {
      try {
        initializeWebSocketServer();
        websocketInitialized = true;
        log(`WebSocket server initialized`);
      } catch (error) {
        console.error('Failed to initialize WebSocket server:', error);
      }
    } else {
      console.warn('WebSocket server initialization function not found');
    }
  };

  // Set up development server with Vite
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Special handling for Replit environment
  const usePort = typeof process.env.PORT === 'string' ? parseInt(process.env.PORT, 10) : primaryPort;
  
  // Add a healthcheck route to confirm the server is running
  app.get('/api/healthcheck', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'MoodLync server is running!' });
  });
  
  // Add a test registration endpoint for debugging
  app.post('/api/test-register', (req, res) => {
    console.log('Test registration request received:', {
      body: req.body,
      headers: req.headers['content-type'],
      method: req.method
    });
    
    return res.status(200).json({
      success: true,
      message: 'Registration data received for testing',
      data: req.body
    });
  });

  // Clearer logging for server start
  log(`Starting MoodLync server on port ${usePort}...`);
  
  // Use 0.0.0.0 instead of localhost to bind to all interfaces
  server.listen(usePort, "0.0.0.0", () => {
    log(`MoodLync server running on port ${usePort}`);
    if (isReplitEnv) {
      log(`Running in Replit environment on port ${usePort}`);
    }
    // Initialize WebSocket server after HTTP server is running
    initializeWebSocketIfNeeded(server);
  });
  
  // For Netlify functions, we'll assign to module.exports in a CommonJS setting
  // or use export default if needed in a separate file
})();