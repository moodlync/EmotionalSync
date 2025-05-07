// CommonJS version for Netlify Functions
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const { v4: uuidv4 } = require('uuid');

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
// Instead we'll create a minimal set of routes
app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API route for authentication status
app.get('/.netlify/functions/api/auth/status', (req, res) => {
  res.json({
    authenticated: req.session && req.session.userId ? true : false,
    userId: req.session && req.session.userId ? req.session.userId : null
  });
});

// Add mock login endpoint for testing
app.post('/.netlify/functions/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  // Mock successful login
  req.session.userId = 1;
  req.session.username = username;
  
  return res.json({
    success: true,
    message: 'Login successful',
    user: { id: 1, username }
  });
});

// Export the serverless handler function
exports.handler = serverless(app);