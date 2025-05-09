// Optimized Netlify Function Handler for MoodLync (ESM Version)
import serverless from 'serverless-http';
import express from 'express';
import { registerRoutes } from './routes.js';

// Create a minimal Express app for serverless function
const app = express();

// Configure Express middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Register API routes
registerRoutes(app);

// Create handler for Netlify Functions
const handleRequest = serverless(app);

// Export handler using ESM syntax
export const handler = async (event, context) => {
  // Handle preflight requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    };
  }
  
  // Process the request with our serverless Express app
  return await handleRequest(event, context);
};