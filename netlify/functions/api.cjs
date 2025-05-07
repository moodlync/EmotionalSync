// CommonJS version of the serverless function for maximum compatibility
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const createMemoryStore = require('memorystore');

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
const MemoryStore = createMemoryStore(session);
app.use(session({
  store: new MemoryStore({
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

// Simple API endpoints for fallback mode
app.get('/.netlify/functions/api/status', (req, res) => {
  res.json({ 
    status: 'ok', 
    mode: 'fallback', 
    message: 'API is running in fallback mode. Some features may be limited.',
    timestamp: new Date().toISOString()
  });
});

app.get('/.netlify/functions/api/*', (req, res) => {
  res.json({ 
    status: 'warning',
    message: 'Running in compatibility mode. Full features available in main deployment.',
    path: req.path 
  });
});

// Export the serverless function
exports.handler = serverless(app);