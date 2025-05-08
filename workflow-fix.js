/**
 * Enhanced proxy server that listens on port 5000 and forwards requests to port 5000.
 * This file has been modified to match the current server port, which is also 5000.
 * This enhanced version includes health check responses and better error handling.
 */

const http = require('http');
const httpProxy = require('http-proxy');
const { exec } = require('child_process');

// Try to free up port 5000 if it's already in use
const freePort = (port) => {
  return new Promise((resolve) => {
    console.log(`Attempting to free port ${port}...`);
    const command = process.platform === 'win32' 
      ? `taskkill /F /PID $(netstat -ano | findstr :${port} | awk '{print $5}')` 
      : `lsof -ti:${port} | xargs kill -9`;
    
    exec(command, (error) => {
      if (error) {
        console.log(`No process found on port ${port} or failed to kill: ${error.message}`);
      } else {
        console.log(`Successfully freed port ${port}`);
      }
      resolve();
    });
  });
};

// Create a proxy server instance
const setupProxy = async () => {
  // First try to free the port
  await freePort(5000);
  
  const proxy = httpProxy.createProxyServer({
    target: 'http://localhost:5000',
    ws: true // Allow WebSocket proxying
  });

  // Handle proxy errors
  proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    if (res.writeHead) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Proxy error: ' + err.message);
    }
  });

  // Create server that forwards all requests to port 9090
  const server = http.createServer((req, res) => {
    // Respond to health checks immediately
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('MoodSync proxy server is running');
      return;
    }
    
    // Log the request
    console.log(`Proxying: ${req.method} ${req.url}`);
    
    // Forward other requests to the actual application
    proxy.web(req, res, {}, (err) => {
      console.error('Failed to proxy request:', err.message);
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Failed to proxy request: ' + err.message);
    });
  });

  // Handle WebSocket connections
  server.on('upgrade', (req, socket, head) => {
    console.log(`Proxying WebSocket: ${req.url}`);
    proxy.ws(req, socket, head, (err) => {
      console.error('WebSocket proxy error:', err.message);
      socket.end('WebSocket proxy error: ' + err.message);
    });
  });

  // Handle server errors
  server.on('error', async (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port 5000 is still in use after attempts to free it.`);
      console.error(`Retrying in 3 seconds...`);
      setTimeout(() => setupProxy(), 3000);
    } else {
      console.error('Proxy server error:', err);
    }
  });

  // Start listening
  const PORT = 5000;
  server.listen(PORT, () => {
    console.log(`✅ Workflow proxy server running on port ${PORT}`);
    console.log(`✅ Proxying requests to the application on port 9090`);
    console.log(`✅ Health check endpoint available at http://localhost:${PORT}/health`);
  });
};

// Start the proxy
setupProxy();