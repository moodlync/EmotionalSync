// Simple Replit Port Adapter for MoodLync
// This script forwards requests from port 5000 to 5173 to help Replit workflow detection

const http = require('http');

// Log timestamp with messages
function log(message) {
  const now = new Date();
  const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
  console.log(`${timestamp} [replit-adapter] ${message}`);
}

// Create the server
const server = http.createServer((req, res) => {
  log(`Forwarding ${req.method} ${req.url} to port 5173`);
  
  // Create options for the proxy request
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  // Forward the request to the actual server
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  // Handle errors
  proxyReq.on('error', (e) => {
    log(`Proxy error: ${e.message}`);
    res.writeHead(500);
    res.end(`Proxy error: ${e.message}`);
  });
  
  // Send the original request body if any
  req.pipe(proxyReq, { end: true });
});

// Start the server
server.listen(5000, '0.0.0.0', () => {
  log('Replit Port Adapter running on port 5000');
  log('Forwarding all requests to application on port 5173');
});

// Log when server closes
process.on('SIGINT', () => {
  log('Shutting down Replit Port Adapter');
  server.close(() => {
    log('Replit Port Adapter stopped');
    process.exit(0);
  });
});