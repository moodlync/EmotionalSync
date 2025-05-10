// Enhanced routes file for Netlify Functions with improved environment detection

/**
 * Register all routes for the Netlify serverless function
 * @param {import('express').Express} app - Express application
 */
export function registerRoutes(app) {
  // Welcome route with detailed environment information
  app.get('/api/healthcheck', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'MoodLync API is running on Netlify Functions!',
      environment: 'netlify',
      timestamp: new Date().toISOString(),
      netlify_environment: process.env.CONTEXT || 'unknown',
      node_version: process.version,
      deployment_url: process.env.DEPLOY_URL || 'unknown'
    });
  });
  
  // Health check route for API testing
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: 'netlify',
      message: 'MoodLync API is healthy'
    });
  });
  
  // Authentication routes
  app.post('/api/login', (req, res) => {
    res.status(401).json({
      error: 'authentication_required',
      message: 'Please use the full MoodLync application for authentication',
      redirect: '/'
    });
  });
  
  app.post('/api/register', (req, res) => {
    res.status(401).json({
      error: 'registration_unavailable',
      message: 'Registration is not available in the Netlify preview environment',
      redirect: '/'
    });
  });
  
  // User info route for testing
  app.get('/api/user', (req, res) => {
    res.status(401).json({
      error: 'not_authenticated',
      message: 'Please log in through the main application',
      environment: 'netlify', 
      redirect: '/'
    });
  });
  
  // Environment detection endpoint for client testing
  app.get('/api/environment', (req, res) => {
    res.json({
      environment: 'netlify',
      isNetlify: true,
      isReplit: false,
      timestamp: new Date().toISOString(),
      netlify_environment: process.env.CONTEXT || 'unknown',
      node_version: process.version,
      deployment_url: process.env.DEPLOY_URL || 'unknown'
    });
  });
  
  // Handle preflight CORS requests for all API routes
  app.options('/api/*', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(204);
  });
  
  // API placeholder routes with improved error handling
  app.all('/api/*', (req, res) => {
    // Log the request for debugging
    console.log(`[Netlify] ${req.method} ${req.path}`);
    
    // Return standardized response for unimplemented endpoints
    res.status(501).json({
      status: 'serverless',
      environment: 'netlify',
      error: 'not_implemented',
      message: 'This API endpoint is available in the full MoodLync application',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  });
  
  return app;
}

// Add a handler export to make this a valid Netlify function
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'MoodLync Routes Handler',
      timestamp: new Date().toISOString()
    })
  };
};