/**
 * Simple Replit Port Forwarder for MoodLync
 * This script creates a simple proxy that forwards requests from port 3000 to 5000
 * to solve Replit WebView connectivity issues.
 */

const http = require('http');
const fs = require('fs');

// Log helper
function log(message) {
  console.log(`[${new Date().toISOString()}] [replit-forwarder] ${message}`);
}

// Set up HTTP server
const server = http.createServer((req, res) => {
  log(`Forwarding request: ${req.method} ${req.url}`);
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  proxyReq.on('error', (err) => {
    log(`Proxy error: ${err.message}`);
    res.writeHead(502);
    res.end(`Proxy error: ${err.message}`);
  });
  
  req.pipe(proxyReq, { end: true });
});

// Set up server error handler
server.on('error', (err) => {
  log(`Server error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    log('Port 3000 is already in use. Please close the application using it and try again.');
    process.exit(1);
  }
});

// Start the server
server.listen(3000, '0.0.0.0', () => {
  log('MoodLync port forwarder running on port 3000, forwarding to port 5000');
  
  // Save the process ID for easy termination
  fs.writeFileSync('simple-forwarder.pid', process.pid.toString());
  
  log('PID saved to simple-forwarder.pid');
});

process.on('SIGINT', () => {
  log('Shutting down MoodLync port forwarder');
  server.close(() => {
    process.exit(0);
  });
});