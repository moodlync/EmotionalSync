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
  let websocketInitialized = false;
  
  // Determine which ports to try based on environment
  const isReplitEnv = !!(process.env.REPL_ID || process.env.REPL_SLUG);
  
  // Use port 8080 for Replit which is our main application port
  const primaryPort = process.env.PORT ? parseInt(process.env.PORT) : 
                     isReplitEnv ? 8080 : 5001;

  // For Replit workflow detection, we run a separate script on port 5000
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
  
  // Listen on primary port (8080 for Replit or 5001 for local/Netlify)
  server.listen(primaryPort, "0.0.0.0", () => {
    const address = server.address();
    const actualPort = typeof address === 'object' && address ? address.port : primaryPort;
    log(`MoodLync server running on port ${actualPort}`);
    
    // Initialize WebSocket on primary server
    initializeWebSocketIfNeeded(server);
    
    // Choose the right approach for Replit workflow compatibility
    if (isReplitEnv) {
      if (primaryPort === workflowPort) {
        log(`Using port ${workflowPort} for both application and workflow compatibility`);
      } else {
        // For Replit, we need to ensure port 5000 is opened somehow for the workflow
        // We'll create a simple minimal HTTP server just for the Replit workflow detection
        try {
          // Try to create a minimal server on port 5000 just to satisfy the workflow
          const signal = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`MoodLync server is running on port ${primaryPort}. Please visit that port instead.`);
          });
          
          signal.listen(workflowPort, "0.0.0.0", () => {
            log(`Workflow compatibility signal running on port ${workflowPort}`);
          }).on('error', (err: any) => {
            console.error(`Workflow compatibility signal couldn't start on port ${workflowPort}: ${err.message}`);
            log(`Application will still function on port ${actualPort} but workflow detection may fail`);
          });
        } catch (error) {
          console.error(`Error creating workflow compatibility signal:`, error);
        }
      }
    }
  }).on('error', (err: any) => {
    console.error(`Failed to start server on port ${primaryPort}:`, err.message);
    console.error(`Server initialization failed. Please check if port ${primaryPort} is already in use.`);
  });
})();
