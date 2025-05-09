// CommonJS version for Netlify Functions
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

// Use a safer approach for determining paths in Netlify environment
let projectRoot;
try {
  // Standard approach
  projectRoot = path.resolve(__dirname, '../..');
} catch (error) {
  // Fallback for Netlify Functions environment
  console.log("Using fallback method for file paths in Netlify environment");
  projectRoot = process.cwd();
}

// Create the express app
const app = express();

// Configure middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware with MemoryStore
const sessionMiddleware = session({
  cookie: { 
    maxAge: 86400000,
    secure: process.env.NODE_ENV === 'production'
  },
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'moodlync-dev-secret-key'
});

app.use(sessionMiddleware);

// Setup initial routes to ensure API is accessible
app.get('/.netlify/functions/api', (req, res) => {
  res.json({
    message: 'MoodLync API is running',
    env: process.env.NODE_ENV,
    node_version: process.version
  });
});

// Register all API routes
// We can't use direct imports here due to CJS format
// Instead we'll use our dedicated routes file
// Import the routes
const { registerRoutes } = require('./routes.cjs');

// Add some basic health check routes
app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Register all the routes from routes.cjs
// This will add our API endpoints
registerRoutes(app);

// Export the serverless handler function
exports.handler = serverless(app);