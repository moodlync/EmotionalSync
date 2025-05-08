/**
 * This is a proxy server that listens on port 5000 and forwards requests to port 9090.
 * It's needed because Replit workflows expect port 5000 to be open, but our actual server runs on 9090.
 */

const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({
  target: 'http://localhost:9090',
  ws: true // Allow WebSocket proxying
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Proxy error: ' + err.message);
});

// Create server that forwards all requests to port 9090
const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Workflow proxy server running on port ${PORT}`);
  console.log(`Proxying requests to the application on port 9090`);
});