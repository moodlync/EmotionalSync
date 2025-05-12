// Static file server for MoodLync landing page
// This is a dedicated server for the Replit environment
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Set CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MoodLync Static Server',
    timestamp: new Date().toISOString()
  });
});

// For any path not found, serve the landing page
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'landing.html'));
});

// Start the server
const port = 3000; // Replit expects this port
app.listen(port, '0.0.0.0', () => {
  console.log(`Static server running on port ${port}`);
});