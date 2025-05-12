/**
 * Special port forwarder for MoodLync that uses a different port
 * to avoid conflicts with existing port 3000 and 5000
 */

import http from 'http';

// Configuration
const APP_PORT = 5000;       // Application port
const FORWARD_PORT = 8080;   // Different port for forwarding

console.log(`Starting special port forwarder for Replit preview...`);
console.log(`Binding to port ${FORWARD_PORT} and forwarding to port ${APP_PORT}`);

// Create a simple proxy server
const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Handle health check
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'up',
      message: 'MoodLync preview forwarder is operational',
      time: new Date().toISOString()
    }));
    return;
  }
  
  console.log(`Forwarding request: ${req.method} ${req.url}`);
  
  // Forward the request to our application
  const proxyReq = http.request({
    hostname: 'localhost',
    port: APP_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Bad Gateway',
        message: 'Cannot connect to application server',
        detail: err.message
      }));
    }
  });
  
  // Forward the request body
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Start the server
server.listen(FORWARD_PORT, '0.0.0.0', () => {
  console.log(`✅ Port forwarder running on port ${FORWARD_PORT}`);
  console.log(`✅ Forwarding requests to application on port ${APP_PORT}`);
  console.log(`✅ Access the application at http://localhost:${FORWARD_PORT}`);
});

// Handle errors
server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  process.exit(1);
});