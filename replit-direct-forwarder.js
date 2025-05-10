// Direct port forwarding solution for Replit
import http from 'http';
import fs from 'fs';

// Configuration
const APP_PORT = 5000;  // The port where our application is running
const WEBVIEW_PORT = 3000;  // The port that Replit's webview will access

// Setup logging
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [DirectForwarder] ${message}`;
  console.log(logMessage);
  fs.appendFileSync('direct-forwarder.log', logMessage + '\n');
}

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  log(`Received request: ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Add Replit-specific header
  res.setHeader('X-Replit-Webview-Marker', 'true');
  
  // Handle OPTIONS requests (CORS preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Health check endpoint
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'MoodLync DirectForwarder is running',
      forwardingTo: APP_PORT,
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // Forward the request to the application server
  const options = {
    hostname: 'localhost',
    port: APP_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    // Copy status code and headers
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    
    // Pipe the response data
    proxyRes.pipe(res);
  });
  
  // Handle errors
  proxyReq.on('error', (err) => {
    log(`Error forwarding request: ${err.message}`);
    
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Bad Gateway',
        message: 'Failed to connect to application server',
        details: err.message
      }));
    }
  });
  
  // Forward request body if present
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  log(`WebSocket upgrade request received for ${req.url}`);
  
  const options = {
    hostname: 'localhost',
    port: APP_PORT,
    path: req.url,
    method: 'GET',
    headers: {
      ...req.headers,
      'Connection': 'Upgrade',
      'Upgrade': 'websocket'
    }
  };
  
  const proxyReq = http.request(options);
  
  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    // Connect the sockets
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
    
    // Handle socket closing
    socket.on('close', () => {
      proxySocket.end();
    });
    
    proxySocket.on('close', () => {
      socket.end();
    });
  });
  
  proxyReq.on('error', (err) => {
    log(`WebSocket proxy error: ${err.message}`);
    socket.end();
  });
  
  proxyReq.end();
});

// Start the server
server.listen(WEBVIEW_PORT, '0.0.0.0', () => {
  log(`✅ DirectForwarder running on port ${WEBVIEW_PORT}`);
  log(`✅ Forwarding all requests to application on port ${APP_PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  log(`Server error: ${err.message}`);
});