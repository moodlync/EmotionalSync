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

// Registration endpoint
app.post('/.netlify/functions/api/register', (req, res) => {
  try {
    const { username, email, password, firstName, lastName, gender, state, country } = req.body;
    
    // Simple validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    
    // Check if username already exists (simple mock check)
    if (username === 'admin') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Create user (mock)
    const userId = Math.floor(Math.random() * 1000) + 1;
    
    // Auto-login the user
    req.session.userId = userId;
    req.session.username = username;
    
    return res.status(201).json({
      id: userId,
      username,
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      gender: gender || 'prefer_not_to_say',
      state: state || '',
      country: country || '',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      error: 'Registration failed',
      details: error.message
    });
  }
});

// Add mock login endpoint for testing
app.post('/.netlify/functions/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple validation
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  
  // Mock successful login
  const userId = Math.floor(Math.random() * 1000) + 1;
  req.session.userId = userId;
  req.session.username = username;
  
  return res.json({
    id: userId,
    username,
    firstName: 'Test',
    lastName: 'User',
    email: `${username}@example.com`,
    role: username === 'admin' ? 'admin' : 'user'
  });
});

// Export the serverless handler function
exports.handler = serverless(app);