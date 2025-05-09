// Simplified routes file for Netlify Functions

/**
 * Register all routes for the Netlify serverless function
 * @param {import('express').Express} app - Express application
 */
export function registerRoutes(app) {
  // Welcome route
  app.get('/api/healthcheck', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'MoodLync API is running on Netlify Functions!',
      environment: 'production',
      timestamp: new Date().toISOString()
    });
  });
  
  // Simple user info route mock for testing
  app.get('/api/user', (req, res) => {
    res.json({
      message: 'Please log in through the main application',
      redirect: '/'
    });
  });
  
  // API placeholder routes
  app.all('/api/*', (req, res) => {
    res.json({
      status: 'serverless',
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