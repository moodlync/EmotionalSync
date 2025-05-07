// NOTE: This file is in ES Module format
// Import required dependencies
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import bodyParser from 'body-parser';
import session from 'express-session';
import createMemoryStore from 'memorystore';

// Import application routes and auth setup
// Use try-catch to handle potential import errors in Netlify environment
let registerRoutes, setupAuth;
try {
  const routes = await import('../../server/routes.js');
  const auth = await import('../../server/auth.js');
  registerRoutes = routes.registerRoutes;
  setupAuth = auth.setupAuth;
} catch (error) {
  console.error('Error importing server modules:', error);
  // Provide fallback implementations if imports fail
  registerRoutes = (app) => {
    console.log('Using fallback routes implementation');
    return app;
  };
  setupAuth = (app) => {
    console.log('Using fallback auth implementation');
    return app;
  };
}

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

// Set up authentication
setupAuth(app);

// Register all routes
registerRoutes(app);

// Export the serverless function
export const handler = serverless(app);