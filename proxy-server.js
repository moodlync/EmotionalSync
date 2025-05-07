// Simple HTTP proxy server to satisfy Replit workflow port requirements
import http from 'http';
import https from 'https';
import { exec } from 'child_process';

// Set up configuration
const PORT = 5000;
const TARGET_PORT = 8080;
const MAX_RETRIES = 5;
let retryCount = 0;

// Kill process on port function
const killProcessOnPort = (port) => {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32' 
      ? `taskkill /F /PID $(netstat -ano | findstr :${port} | awk '{print $5}')` 
      : `kill $(lsof -t -i:${port})`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`No process found on port ${port} or failed to kill: ${error.message}`);
      } else {
        console.log(`Process on port ${port} has been terminated`);
      }
      resolve();
    });
  });
};

// Start proxy server function
const startProxyServer = async () => {
  console.log(`Setting up proxy server on port ${PORT} to forward to port ${TARGET_PORT}`);
  
  try {
    // Try to kill any process on PORT
    await killProcessOnPort(PORT);
    
    // Create a simple HTTP server
    const server = http.createServer((req, res) => {
      // Check if this is a request from the Replit health check
      if (req.url === '/health' || req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('MoodLync proxy running');
        return;
      }
      
      console.log(`Proxying request: ${req.method} ${req.url}`);
      
      // Forward the request to our actual server
      const options = {
        hostname: 'localhost',
        port: TARGET_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
      };
      
      // Check if target server is available
      const checkTarget = http.request({
        hostname: 'localhost',
        port: TARGET_PORT,
        path: '/',
        method: 'HEAD',
        timeout: 500
      });
      
      checkTarget.on('error', () => {
        res.writeHead(503);
        res.end('Target server not available yet');
      });
      
      checkTarget.on('response', () => {
        // Target is up, forward the request
        const proxyReq = http.request(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        });
        
        proxyReq.on('error', (err) => {
          console.error('Proxy request error:', err);
          res.writeHead(500);
          res.end(`Proxy error: ${err.message}`);
        });
        
        // Forward the request body if any
        req.pipe(proxyReq);
      });
      
      checkTarget.end();
    });

    // Handle server errors
    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retry ${retryCount}/${MAX_RETRIES} - Attempting to terminate existing process...`);
          await killProcessOnPort(PORT);
          
          // Wait a moment and try again
          setTimeout(startProxyServer, 1000);
        } else {
          console.error(`Maximum retries (${MAX_RETRIES}) reached. The proxy server will not run.`);
          console.error('This might affect the Replit workflow that expects port 5000.');
        }
      } else {
        console.error('Proxy server error:', err);
      }
    });

    // Start the server
    server.listen(PORT, () => {
      console.log(`Proxy server running on port ${PORT} -> forwarding to port ${TARGET_PORT}`);
    });
  } catch (error) {
    console.error('Failed to start proxy server:', error);
  }
};

// Start the proxy server
startProxyServer();