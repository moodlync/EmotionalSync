/**
 * Replit Port Proxy
 * 
 * This script creates a simple proxy server that listens on port 5000 (for Replit workflow)
 * and forwards requests to the actual application on port 8080.
 * 
 * This solves the issue where Replit's workflow is configured to wait for port 5000,
 * but our application needs to run on a different port due to port conflicts.
 */

const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Handle proxy errors
proxy.on('error', function(err, req, res) {
  console.error('Proxy error:', err);
  
  if (res.writeHead && !res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.message);
  }
});

// Create a server that uses the proxy
const server = http.createServer(function(req, res) {
  // Target our application running on port 8080
  proxy.web(req, res, { target: 'http://localhost:8080' });
});

// Listen on port 5000
server.listen(5000, () => {
  console.log('Replit port proxy listening on port 5000, forwarding to port 8080');
});