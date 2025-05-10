/**
 * MoodLync Replit Web Server
 * 
 * This script creates a simple HTTP server that runs on port 3000
 * and forwards requests to the main application on port 5000.
 * 
 * This is necessary for Replit's webview to work correctly.
 */

import http from 'http';
import httpProxy from 'http-proxy';
const { createProxyServer } = httpProxy;

// Configuration
const TARGET_PORT = 5000;
const WEBVIEW_PORT = 3000;

// Create a proxy server
const proxy = createProxyServer({
  target: `http://localhost:${TARGET_PORT}`,
  ws: true,
  changeOrigin: true
});

// Log info with timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] [ReplitForwarder] ${message}`);
}

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  log(`Proxy error: ${err.message}`);
  if (res.writeHead && !res.headersSent) {
    res.writeHead(502, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      error: 'Proxy Error',
      message: 'The application server is temporarily unavailable.',
      code: err.code || 'UNKNOWN'
    }));
  }
});

// Create server
const server = http.createServer((req, res) => {
  // Log the request
  if (!req.url?.includes('/health') && !req.url?.includes('/favicon.ico')) {
    log(`${req.method} ${req.url}`);
  }

  // Forward the request
  proxy.web(req, res, { target: `http://localhost:${TARGET_PORT}` });
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  log(`WebSocket upgrade: ${req.url}`);
  proxy.ws(req, socket, head);
});

// Start the server
server.listen(WEBVIEW_PORT, '0.0.0.0', () => {
  log(`✅ Replit forwarder running on port ${WEBVIEW_PORT}`);
  log(`✅ Forwarding requests to http://localhost:${TARGET_PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  log('SIGINT received, closing server...');
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('SIGTERM received, closing server...');
  server.close();
  process.exit(0);
});