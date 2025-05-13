/**
 * Replit Port Adapter for MoodLync
 * 
 * This script creates an HTTP server that listens on port 5000 and forwards all
 * requests to the actual application server running on port 5173. This helps
 * Replit workflow detection work correctly.
 */

import http from 'http';
import { createProxyServer } from 'http-proxy';

// Create a proxy server
const proxy = createProxyServer({});

// Log timestamp with messages
function log(message) {
  const now = new Date();
  const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
  console.log(`${timestamp} [replit-adapter] ${message}`);
}

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  log(`Proxy error: ${err}`);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy error occurred');
});

// Create the server
const server = http.createServer((req, res) => {
  // Log information about the request
  log(`Forwarding ${req.method} ${req.url} to port 5173`);
  
  // Forward the request to the actual server
  proxy.web(req, res, { target: 'http://localhost:5173' });
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