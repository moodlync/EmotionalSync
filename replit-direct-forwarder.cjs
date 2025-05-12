#!/usr/bin/env node

/**
 * MoodLync Direct Port Forwarder for Replit
 * 
 * A simple CommonJS script that forwards requests from port 3000 to port 5000.
 * This script is specially designed to work in the Replit environment.
 */

const http = require('http');

// Configuration
const APP_PORT = 5000;   // Your application runs on this port
const REPLIT_PORT = 3000; // Replit expects the app on this port

// Create server
const server = http.createServer((req, res) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Handle CORS for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Forward the request to the actual application
  const options = {
    hostname: 'localhost',
    port: APP_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MoodLync - Service Unavailable</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #6366F1, #4F46E5);
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .container {
            max-width: 600px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 16px;
            padding: 30px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .error {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Service Temporarily Unavailable</h1>
          <p>We're having trouble connecting to the MoodLync application.</p>
          <div class="error">
            <p>Error: ${err.message}</p>
            <p>Make sure the application server is running on port ${APP_PORT}.</p>
          </div>
          <p>Please try refreshing the page in a few moments.</p>
        </div>
      </body>
      </html>
    `);
  });
  
  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Start the server
server.listen(REPLIT_PORT, '0.0.0.0', () => {
  console.log('=================================================');
  console.log(`MoodLync Replit Port Forwarder`);
  console.log('=================================================');
  console.log(`Forwarding requests from port ${REPLIT_PORT} to port ${APP_PORT}`);
  console.log(`Server running at http://localhost:${REPLIT_PORT}`);
  console.log('=================================================');
});

// Handle server errors
server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${REPLIT_PORT} is already in use.`);
    console.error(`Please stop any other servers running on port ${REPLIT_PORT} and try again.`);
  }
});