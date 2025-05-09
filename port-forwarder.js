/**
 * Simple Port Forwarder for MoodSync
 * This script helps with port accessibility in the Replit environment
 */
const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({});
const PORT = 4000; // We'll forward traffic from port 4000 to 5000

// Create a proxy server with custom routing
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // Forward all traffic to the main application server
  proxy.web(req, res, { target: 'http://localhost:5000' }, (err) => {
    if (err) {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Proxy error');
    }
  });
});

// Start the proxy server
server.listen(PORT, () => {
  console.log(`Port forwarder running on port ${PORT}, forwarding to port 5000`);
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy error');
});