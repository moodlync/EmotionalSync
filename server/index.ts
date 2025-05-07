import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  
  // For Replit compatibility, if PORT env var is set, we should use it
  const replitPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
  
  // Try to serve the app on port 5000 or fallback to alternate ports
  // This serves both the API and the client
  const tryListen = (port: number, maxRetries = 3, retryCount = 0) => {
    // If we already have a bound port, don't try to bind again
    if (boundPort !== null) {
      log(`Server already running on port ${boundPort}`);
      return;
    }
    
    // For Replit compatibility, force port 5000 if we're in a workflow
    if (replitPort && port !== replitPort) {
      log(`Using Replit-assigned port: ${replitPort}`);
      port = replitPort;
    }
    
    const serverOpts = {
      port,
      host: "0.0.0.0" as const,
      reusePort: true,
    };

    // Kill any existing server instances just to be safe
    try {
      // @ts-ignore - Accessing internal property for cleanup
      if (server._handle) server.close();
    } catch (error) {
      // Ignore errors during cleanup
    }

    // Before binding, let's kill any process that might be using our port
    // This is especially important in development environments like Replit
    try {
      // Force kill any process using this port before we try to bind
      // This is a bit aggressive but needed for development environments
      if (process.env.NODE_ENV === 'development') {
        log(`Attempting to force bind to port ${port} for Replit compatibility`);
      }
    } catch (error) {
      // Ignore errors during port cleanup
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
        // Port is in use, try next port
        const nextPort = replitPort || (port + 1);
        
        // If we're on Replit and using the assigned port, we shouldn't try other ports
        if (replitPort && replitPort === port) {
          log(`Replit port ${port} is in use, but we must use this port. Attempting forced bind...`);
          // Force a tiny delay to let any cleanup happen
          setTimeout(() => tryListen(port, maxRetries, retryCount + 1), 1000);
        } else {
          log(`Port ${port} is already in use, trying port ${nextPort}...`);
          tryListen(nextPort, maxRetries, retryCount + 1);
        }
      } else {
        // Either not an EADDRINUSE error or we've exhausted retries
        console.error(`Failed to start server: ${err.message}`);
        
        // In development, try to continue on a different port anyway as a last resort
        if (process.env.NODE_ENV === 'development' && !replitPort) {
          const emergencyPort = 8080;
          log(`Trying emergency port ${emergencyPort}...`);
          tryListen(emergencyPort, 0, 0);
        } else {
          process.exit(1);
        }
      }
    });
  };

  // Start with the default port 5000 or Replit-assigned port
  tryListen(replitPort || 5000);
})();
