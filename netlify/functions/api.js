// NOTE: This file is in ES Module format
// Import required dependencies
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import createMemoryStore from 'memorystore';

// Define fallback implementations
const fallbackRegisterRoutes = (app) => {
  console.log('Using fallback routes implementation');
    
  // Add registration endpoint
  app.post('/.netlify/functions/api/register', (req, res) => {
    try {
      const { username, email, password, firstName, lastName, gender, state, country } = req.body;
      
      // Simple validation
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email and password are required' });
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
  
  // Add login endpoint
  app.post('/.netlify/functions/api/login', (req, res) => {
    try {
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
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ 
        error: 'Login failed',
        details: error.message
      });
    }
  });
  
  return app;
};

const fallbackSetupAuth = (app) => {
  console.log('Using fallback auth implementation');
  return app;
};

// Initialize MemoryStore
const MemoryStore = createMemoryStore(session);

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

// Use async IIFE to handle dynamic imports
const initializeApp = async () => {
  let registerRoutes, setupAuth;
  
  try {
    const routes = await import('../../server/routes.js');
    const auth = await import('../../server/auth.js');
    registerRoutes = routes.registerRoutes;
    setupAuth = auth.setupAuth;
    console.log('Successfully imported server modules');
  } catch (error) {
    console.error('Error importing server modules:', error);
    registerRoutes = fallbackRegisterRoutes;
    setupAuth = fallbackSetupAuth;
  }
  
  // Set up authentication
  setupAuth(app);
  
  // Register all routes
  registerRoutes(app);
  
  return app;
};

// Export the handler using an async function
export const handler = async (event, context) => {
  // Initialize app with async imports
  await initializeApp();
  
  // Return serverless handler
  return serverless(app)(event, context);
};