// Safely import dependencies with fallbacks for Netlify deployment
let express, serverless, cors, bodyParser, session, MemoryStore;

try {
  express = require('express');
  serverless = require('serverless-http');
  cors = require('cors');
  bodyParser = require('body-parser');
  session = require('express-session');
  MemoryStore = require('memorystore');
} catch (e) {
  console.error('Failed to load dependencies via require:', e);
  try {
    // Try ES module imports as fallback
    express = (await import('express')).default;
    serverless = (await import('serverless-http')).default;
    cors = (await import('cors')).default;
    bodyParser = (await import('body-parser')).default;
    session = (await import('express-session')).default;
    MemoryStore = (await import('memorystore')).default;
  } catch (esImportError) {
    console.error('Failed to load dependencies via ES imports:', esImportError);
    throw new Error('Critical dependencies missing. Check serverless-http and cors installation.');
  }
}

// Import application routes and auth setup
import { registerRoutes } from '../../server/routes.js';
import { setupAuth } from '../../server/auth.js';

// Initialize Express
const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.NETLIFY ? process.env.URL : 'http://localhost:3000',
  credentials: true
}));

// Parse requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // Prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'moodsync-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set up authentication
setupAuth(app);

// Register all routes
registerRoutes(app);

// Export the serverless function
export const handler = serverless(app);