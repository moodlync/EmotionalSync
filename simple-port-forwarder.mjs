/**
 * Simple Port Forwarder for MoodSync
 * This minimal script helps Replit access our application properly
 * Updated to use ES modules
 */

import http from 'http';
import httpProxy from 'http-proxy';

// Target the main app running on port 5000
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:5000',
  ws: true,
  changeOrigin: true
});

// Log proxy errors but don't crash
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res && res.writeHead) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy Error');
  }
});

// Create a simple server that proxies everything to our main app
const server = http.createServer((req, res) => {
  // Add CORS headers for browser compatibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Log incoming requests
  console.log(`Forwarding request: ${req.method} ${req.url}`);
  
  // Forward the request to our main app
  proxy.web(req, res);
});

// Support WebSocket forwarding as well
server.on('upgrade', (req, socket, head) => {
  console.log('Forwarding WebSocket connection');
  proxy.ws(req, socket, head);
});

// Special Replit port for visibility
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Port forwarder running on port ${PORT}`);
  console.log(`✅ Forwarding requests to application on port 5000`);
});