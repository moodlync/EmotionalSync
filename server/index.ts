import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import { createServer } from 'http';
import { startPortForwarder } from "./port-forward";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enhanced CORS settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Special route for health checks
app.get('/__replit_health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Set environment variables
const PORT = Number(process.env.PORT || 5000);
const HOST = '0.0.0.0';

// Main async function for setup
async function main() {
  // Register all application routes
  await registerRoutes(app);

  // Create HTTP server
  const server = createServer(app);

  // Setup Vite for development or serve static files for production
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  server.listen(PORT, HOST, () => {
    log(`MoodLync server running at http://${HOST}:${PORT}`);
    log(`Replit environment detected: ${process.env.REPL_ID ? 'Yes' : 'No'}`);
    log(`Application URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    
    // Start port forwarder for Replit environment
    if (process.env.REPL_ID) {
      startPortForwarder();
      log('Port forwarder started for Replit environment');
    }
  });
}

// Run the app
main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});