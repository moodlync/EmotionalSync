import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import * as http from 'http';
import { createServer } from 'http';
import { startPortForwarder } from "./port-forward";
import { startESMPortForwarder } from "./esm-port-forward";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for all routes
// Enable CORS for all routes with more permissive settings
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Additional headers for broader compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
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

  // Add a diagnostics endpoint that serves a static HTML page
  app.get('/diagnostics', (req, res) => {
    res.sendFile('diagnostic.html', { root: 'public' });
  });

  // Global variables to track the server state
  let websocketInitialized = false;

  // Determine which ports to try based on environment
  const isReplitEnv = !!(process.env.REPL_ID || process.env.REPL_SLUG || process.env.REPLIT_ENVIRONMENT || process.env.IS_REPLIT);

  // Set Replit environment variables for downstream components
  if (isReplitEnv) {
    process.env.REPLIT_ENVIRONMENT = 'true';
    process.env.IS_REPLIT = 'true';
  }

  // Use port 5000 for our application server
  const primaryPort = 5000;

  // This is the port that Replit webview will access via the port forwarder (3000)
  const webviewPort = 3000;

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

  // Enhanced debug information for Replit environment
  if (isReplitEnv) {
    log("=== Replit Environment Information ===");
    log(`PORT: ${process.env.PORT || 'Not set'}`);
    log(`REPL_ID: ${process.env.REPL_ID || 'Not set'}`);
    log(`REPL_SLUG: ${process.env.REPL_SLUG || 'Not set'}`);
    log(`REPL_OWNER: ${process.env.REPL_OWNER || 'Not set'}`);
    log(`REPLIT_ENVIRONMENT: ${process.env.REPLIT_ENVIRONMENT || 'Not set'}`);
    log(`IS_REPLIT: ${process.env.IS_REPLIT || 'Not set'}`);
    log(`Application Port: ${primaryPort}`);
    log(`Webview Port: ${webviewPort}`);
    log(`Node.js Version: ${process.version}`);
    log(`Process ID: ${process.pid}`);
    log("=====================================");

    // Add a diagnostic API route with detailed environment info
    app.get('/api/environment', (req, res) => {
      res.json({
        environment: 'replit',
        isReplit: true,
        isNetlify: false,
        repl_id: process.env.REPL_ID,
        repl_slug: process.env.REPL_SLUG,
        repl_owner: process.env.REPL_OWNER,
        node_version: process.version,
        ports: {
          application: primaryPort,
          webview: webviewPort,
          env_port: process.env.PORT
        },
        headers: req.headers,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Ensure we're binding to all interfaces and setting proper CORS
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    log(`MoodLync server running at http://0.0.0.0:${PORT}`);
    if (isReplitEnv) {
      log(`Running in Replit environment on port ${PORT}`);
      log(`Application available at https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
      log(`Webview will access application via port 3000`);

      // Start the port forwarder in Replit environment
      try {
        // Create a lightweight HTTP healthcheck endpoint on port 3000
        // This ensures Replit webview can detect our application
        // Note: Using the already imported http module - no need for require
        const healthServer = createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          // Forward requests to our main app except for basic healthcheck
          if (req.url === '/' || req.url === '/health') {
            res.writeHead(200);
            res.end(JSON.stringify({
              status: 'ok',
              message: 'MoodLync is running',
              port: usePort,
              webviewPort: webviewPort,
              timestamp: new Date().toISOString()
            }));
          } else {
            // Tell client to redirect to our main port
            res.writeHead(307, {
              'Location': `http://localhost:${usePort}${req.url}`
            });
            res.end();
          }
        });

        // Try to start the ESM-compatible port forwarder first
        try {
          // Start the port forwarder using ESM syntax
          const esmForwarder = startESMPortForwarder();
          log("✅ ESM Port forwarder started to expose application to the internet");

          // We need to handle process termination properly
          process.on('SIGINT', () => {
            log('SIGINT received, closing servers...');
            esmForwarder.close();
            process.exit(0);
          });

          process.on('SIGTERM', () => {
            log('SIGTERM received, closing servers...');
            esmForwarder.close();
            process.exit(0);
          });
        } catch (esmError) {
          log(`Error with ESM port forwarder: ${esmError instanceof Error ? esmError.message : String(esmError)}`);

          // Fallback to webview healthcheck
          try {
            // Start the webview healthcheck server on port 3000
            healthServer.listen(webviewPort, '0.0.0.0', () => {
              log(`✅ Webview healthcheck running on port ${webviewPort}`);
            });

            // We need to handle process termination properly
            process.on('SIGINT', () => {
              log('SIGINT received, closing servers...');
              healthServer.close();
              process.exit(0);
            });

            process.on('SIGTERM', () => {
              log('SIGTERM received, closing servers...');
              healthServer.close();
              process.exit(0);
            });
          } catch (healthError) {
            log(`Failed to start health server: ${healthError instanceof Error ? healthError.message : String(healthError)}`);
          }
        }
      } catch (error) {
        log(`Failed to start port forwarder: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // Initialize WebSocket server after HTTP server is running
    initializeWebSocketIfNeeded(server);
  });

  // For Netlify functions, we'll assign to module.exports in a CommonJS setting
  // or use export default if needed in a separate file
})();