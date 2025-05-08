/**
 * Replit Workflow Compatibility Proxy Server
 * 
 * This server listens on port 5000 (for Replit workflow) and 
 * forwards requests to the actual application on port 9090.
 */

const http = require('http');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Create Express app
const app = express();

// Log all requests
app.use((req, res, next) => {
  console.log(`Proxy received: ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Proxy server is healthy');
});

// Configure proxy middleware
const proxyOptions = {
  target: 'http://localhost:9090',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  logLevel: 'warn',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to port 9090`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.message);
  }
};

// Apply proxy middleware to all routes except health check
app.use('/', createProxyMiddleware(proxyOptions));

// Start server on port 5000 which is what Replit expects
const server = http.createServer(app);

// Handle WebSocket upgrade events
server.on('upgrade', createProxyMiddleware(proxyOptions).upgrade);

// Retry logic for starting the server
const startServer = (retries = 5) => {
  try {
    server.listen(5000, () => {
      console.log('✅ Replit-compatible proxy server running on port 5000');
      console.log('✅ Forwarding requests to application on port 9090');
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE' && retries > 0) {
        console.log(`Port 5000 in use, retrying in 1 second... (${retries} attempts left)`);
        setTimeout(() => startServer(retries - 1), 1000);
      } else {
        console.error('Failed to start proxy server:', err.message);
      }
    });
  } catch (err) {
    console.error('Error starting proxy server:', err.message);
    if (retries > 0) {
      console.log(`Retrying in 1 second... (${retries} attempts left)`);
      setTimeout(() => startServer(retries - 1), 1000);
    }
  }
};

// Start the server with retry logic
startServer();