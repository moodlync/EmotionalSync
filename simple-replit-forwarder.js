// A very simple port forwarder for Replit
const http = require('http');
const httpProxy = require('http-proxy');
const fs = require('fs');

// Open a log file
const logFile = fs.createWriteStream('forwarder.log', { flags: 'a' });

// Log to both console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  logFile.write(logMessage + '\n');
}

// Create a proxy server
log('Creating proxy server...');
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:5000',
  ws: true
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  log(`Proxy error: ${err.message}`);
  if (res.writeHead) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy Error');
  }
});

// Create a server
const server = http.createServer((req, res) => {
  log(`Request: ${req.method} ${req.url}`);
  
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Forward the request
  proxy.web(req, res);
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  log('WebSocket connection');
  proxy.ws(req, socket, head);
});

// Start the server
const port = process.env.PORT || 8080;
server.listen(port, '0.0.0.0', () => {
  log(`Port forwarder running on port ${port}`);
  log(`Forwarding to application on port 5000`);
});

// Keep the process alive
process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`);
});