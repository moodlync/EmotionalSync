/**
 * Replit Port Forwarder for MoodLync
 * Enhanced version with better error handling and reconnection logic
 */

import http from 'http';
import httpProxy from 'http-proxy';
import { setTimeout } from 'timers/promises';

// Configuration
const TARGET_PORT = 5000;
const PUBLIC_PORT = process.env.PORT || 8080;
const MAX_RETRIES = 10;
const RETRY_DELAY = 5000; // 5 seconds between retries
const TARGET_URL = `http://localhost:${TARGET_PORT}`;

// Status tracking
let isTargetAvailable = false;
let retryCount = 0;
let connectedClients = 0;

// Create a new proxy server
console.log(`Creating proxy server targeting application on port ${TARGET_PORT}...`);
const proxy = httpProxy.createProxyServer({
  target: TARGET_URL,
  ws: true,
  changeOrigin: true,
  xfwd: true,
  autoRewrite: true
});

// Handle proxy errors gracefully
proxy.on('error', async (err, req, res) => {
  const errorTime = new Date().toISOString();
  console.error(`[${errorTime}] Proxy error:`, err.message);
  
  // Check if the target server is available
  if (err.code === 'ECONNREFUSED') {
    isTargetAvailable = false;
    console.log(`[${errorTime}] Target server not available. Will retry connection...`);
    
    // Try to reconnect after a delay
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      await checkTargetAvailability();
    }
  }
  
  // Send an error response if possible
  if (res && !res.headersSent) {
    try {
      res.writeHead(502, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ 
        error: 'Proxy Error', 
        message: 'The application server is temporarily unavailable. Please try again in a moment.',
        code: err.code || 'UNKNOWN'
      }));
    } catch (responseError) {
      console.error(`[${errorTime}] Error sending error response:`, responseError.message);
    }
  }
});

// Create a server object
const server = http.createServer((req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Log the request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Check if target is available before proxying
  if (isTargetAvailable) {
    proxy.web(req, res, { target: TARGET_URL }, (err) => {
      console.error('Failed to proxy request:', err.message);
      
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Proxy Error', message: err.message }));
      }
    });
  } else {
    // If target is not available, return a useful message
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      error: 'Service Unavailable', 
      message: 'The application server is starting up. Please try again in a moment.' 
    }));
    
    // Try to check if target is available now
    checkTargetAvailability().catch(console.error);
  }
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  console.log(`[${new Date().toISOString()}] WebSocket connection initiated`);
  
  if (isTargetAvailable) {
    proxy.ws(req, socket, head, { target: TARGET_URL }, (err) => {
      console.error('WebSocket proxy error:', err.message);
      socket.end();
    });
    
    // Track connections
    connectedClients++;
    console.log(`Active WebSocket connections: ${connectedClients}`);
    
    // Track disconnections
    socket.on('close', () => {
      connectedClients--;
      console.log(`WebSocket connection closed. Active connections: ${connectedClients}`);
    });
  } else {
    // If target is not available, close the connection
    console.log('WebSocket connection rejected - target unavailable');
    socket.end();
  }
});

// Check if target server is available
async function checkTargetAvailability() {
  return new Promise((resolve) => {
    // First try the health endpoint
    const req = http.request({
      hostname: 'localhost',
      port: TARGET_PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 5000 // Increased timeout
    }, (res) => {
      // Start reading the body to properly complete the request
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          isTargetAvailable = true;
          retryCount = 0;
          console.log(`[${new Date().toISOString()}] Target server is available!`);
          resolve(true);
        } else {
          isTargetAvailable = false;
          console.log(`[${new Date().toISOString()}] Target server returned status ${res.statusCode}: ${data}`);
          resolve(false);
        }
      });
    });
    
    req.on('error', (err) => {
      isTargetAvailable = false;
      console.log(`[${new Date().toISOString()}] Target server check failed (attempt ${retryCount + 1}/${MAX_RETRIES}): ${err.message}`);
      
      // If health check failed, try the debug endpoint as fallback
      tryDebugEndpoint().catch(() => {});
      
      resolve(false);
    });
    
    req.on('timeout', () => {
      req.destroy();
      isTargetAvailable = false;
      console.log(`[${new Date().toISOString()}] Target server health check timed out, trying fallback endpoint`);
      
      // Try debug endpoint as fallback
      tryDebugEndpoint().catch(() => {});
      
      resolve(false);
    });
    
    req.end();
  });
}

// Try the debug endpoint as a fallback for availability check
async function tryDebugEndpoint() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: TARGET_PORT,
      path: '/debug',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      if (res.statusCode === 200) {
        isTargetAvailable = true;
        retryCount = 0;
        console.log(`[${new Date().toISOString()}] Target server is available via debug endpoint!`);
        resolve(true);
      } else {
        reject(new Error(`Debug endpoint returned status ${res.statusCode}`));
      }
      
      // Consume the response
      res.resume();
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Debug endpoint request timed out'));
    });
    
    req.end();
  });
}

// Start the server
server.listen(PUBLIC_PORT, '0.0.0.0', () => {
  const startTime = new Date().toISOString();
  console.log(`[${startTime}] ✅ Port forwarder running on port ${PUBLIC_PORT}`);
  console.log(`[${startTime}] ✅ Forwarding requests to http://localhost:${TARGET_PORT}`);
  console.log(`[${startTime}] 🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode`);
  
  // Check target availability immediately
  checkTargetAvailability().catch(console.error);
});

// Check target availability periodically
(async function checkLoop() {
  while (true) {
    await setTimeout(10000); // Check every 10 seconds
    if (!isTargetAvailable) {
      await checkTargetAvailability().catch(console.error);
    }
  }
})().catch(console.error);

// Handle process termination
process.on('SIGINT', () => {
  console.log('Port forwarder shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // Keep the process running
});