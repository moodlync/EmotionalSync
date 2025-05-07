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
  
  // For Replit compatibility, try to use port 5000 directly
  const primaryPort = 5000;
  const alternativePort = 8080;
  
  // Try to serve the app on port 5000 first
  // This serves both the API and the client
  const tryListen = (port: number, maxRetries = 3, retryCount = 0) => {
    // If we already have a bound port, don't try to bind again
    if (boundPort !== null) {
      log(`Server already running on port ${boundPort}`);
      return;
    }
    
    // Always try port 5000 first to satisfy Replit workflow
    const usePort = port;
    
    const serverOpts = {
      port: usePort,
      host: "0.0.0.0" as const,
    };
    
    log(`Attempting to start server on an available port...`);

    // Kill any existing server instances just to be safe
    try {
      // @ts-ignore - Accessing internal property for cleanup
      if (server._handle) server.close();
    } catch (error) {
      // Ignore errors during cleanup
    }

    server.listen(serverOpts, () => {
      try {
        // Get the actual bound port - might be different from the requested port
        const address = server.address();
        const actualPort = typeof address === 'object' && address ? address.port : port;
        
        // Remember the bound port to prevent multiple bindings
        boundPort = actualPort;
        log(`MoodLync server running on port ${actualPort}`);
      
        // Initialize WebSocket only once
        if (!websocketInitialized) {
          // After server starts successfully, initialize WebSocket
          // We need to access this function from routes.ts
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
      } catch (error) {
        console.error('Error during server initialization:', error);
      }
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE' && retryCount < maxRetries) {
        log(`Port ${usePort} is in use, trying a different port...`);
        
        // Try next available port with a slight delay
        const emergencyPort = 9090 + retryCount;
        setTimeout(() => tryListen(emergencyPort, maxRetries, retryCount + 1), 500);
      } else {
        // Either not an EADDRINUSE error or we've exhausted retries
        console.error(`Failed to start server: ${err.message}`);
        
        // In development, try to continue on a different port anyway as a last resort
        if (process.env.NODE_ENV === 'development') {
          const emergencyPort = 7777;
          log(`Trying emergency port ${emergencyPort}...`);
          tryListen(emergencyPort, 0, 0);
        } else {
          process.exit(1);
        }
      }
    });
  };

  // Skip the port checking and directly try to bind
  log(`Replit workflow requires port 5000, attempting to start server...`);
  
  // Try to directly start on port 5000 first - Replit workflow needs this
  // We can still fall back to alternative ports if needed
  setTimeout(() => tryListen(primaryPort), 100);
})();
