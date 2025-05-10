import express from "express";
import { registerSimpleRoutes } from "./simple-routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Since __dirname is not available in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true,
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

// Simple request logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    simplifiedMode: true
  });
});

// Start the server
async function start() {
  try {
    // Register routes and get HTTP server
    const server = await registerSimpleRoutes(app);
    
    // Setup Vite for development
    setupVite(app, server);
    
    // Choose port
    const port = process.env.PORT || 5000;
    
    // Start listening
    server.listen(port, () => {
      log(`Server running at http://localhost:${port}`);
      console.log(`Server running at http://localhost:${port}`);
    });
    
    // Handle shutdown gracefully
    const shutdown = () => {
      console.log('Shutting down server...');
      server.close(() => {
        console.log('Server shut down successfully');
        process.exit(0);
      });
    };
    
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();