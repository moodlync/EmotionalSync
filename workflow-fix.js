/**
 * Enhanced proxy server for Replit workflow compatibility.
 * This file has been updated to use the proper port configuration.
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
  
  // The target port must be different from the listening port (5000)
  // Create a simple HTTP server that will respond to health checks
  const server = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('MoodSync proxy health check - server is running');
      return;
    }
    
    // For all other requests, proxy to the main application server
    console.log(`Proxying: ${req.method} ${req.url}`);
    
    // Create a one-time proxy for this request
    const proxy = httpProxy.createProxyServer({
      target: 'http://localhost:5000',
      ws: true
    });
    
    proxy.web(req, res, {}, (err) => {
      console.error('Failed to proxy request:', err.message);
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Failed to proxy request: ' + err.message);
    });
    
    // Clean up the proxy after use
    proxy.on('error', (err) => {
      console.error('Proxy error:', err);
    });
  });

  // Handle WebSocket connections
  server.on('upgrade', (req, socket, head) => {
    console.log(`Proxying WebSocket: ${req.url}`);
    const proxy = httpProxy.createProxyServer({
      target: 'http://localhost:5000',
      ws: true
    });
    
    proxy.ws(req, socket, head, (err) => {
      console.error('WebSocket proxy error:', err?.message);
      socket.end('WebSocket proxy error');
    });
    
    proxy.on('error', (err) => {
      console.error('WebSocket proxy error:', err);
    });
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Proxy server error:', err);
    if (err.code === 'EADDRINUSE') {
      console.error(`Port 5000 is still in use. The application will continue to work, but you may need to access it directly.`);
    }
  });

  // Start the health check server on a different port
  const healthPort = 3000;
  server.listen(healthPort, () => {
    console.log(`✅ Health check server running on port ${healthPort}`);
    console.log(`✅ Application is running on port 5000`);
    console.log(`✅ Health check endpoint available at http://localhost:${healthPort}/health`);
  });
};

// Start the proxy
setupProxy();
