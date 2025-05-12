import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import * * as http from 'http';
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

// Register all application routes
await registerRoutes(app);

// Create HTTP server
const server = createServer(app);

// Set environment variables
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  log(`MoodLync server running at http://${HOST}:${PORT}`);
  log(`Replit environment detected: ${process.env.REPL_ID ? 'Yes' : 'No'}`);
  log(`Application URL: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
});