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
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Max-Age': '86400'
      }
    };
  }
  
  // Add CORS headers to all responses
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Log API request for debugging (excluding health checks)
  if (!event.path.includes('/health')) {
    console.log(`Netlify Function Request: ${event.httpMethod} ${event.path}`);
  }
  
  // Process the request with our serverless Express app
  const response = await handleRequest(event, context);
  
  // Ensure CORS headers are present in all responses
  if (!response.headers) {
    response.headers = {};
  }
  
  // Add CORS headers
  response.headers['Access-Control-Allow-Origin'] = '*';
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With';
  
  return response;
};