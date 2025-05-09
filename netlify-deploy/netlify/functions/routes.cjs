// Simplified routes file for Netlify Functions (CommonJS version)

/**
 * Register all routes for the Netlify serverless function
 * @param {import('express').Express} app - Express application
 */
function registerRoutes(app) {
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

// Export using CommonJS syntax
module.exports = { registerRoutes };