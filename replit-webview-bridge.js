/**
 * MoodLync Replit Webview Bridge
 * 
 * This specialized script creates a direct connection between Replit's webview
 * and our application server. It listens on port 443 (HTTPS) which Replit requires
 * for its webview to work properly, and forwards requests to our app server.
 * 
 * The key improvement is binding to 0.0.0.0 which allows external connections,
 * and better handling WebSocket connections that our real-time features need.
 */

// Using ES modules instead of CommonJS for better compatibility
import http from 'http';
import { createProxyServer } from 'http-proxy';
import fs from 'fs';

// Configuration
const TARGET_PORT = 5000;           // Main application port
const WEBVIEW_PORT = 443;           // Replit webview expects this to be 443
const BIND_ADDRESS = '0.0.0.0';     // Important: This allows external connections

// Create timestamp logs for debugging
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [WebviewBridge] ${message}`;
  console.log(logMessage);
  
  // Also append to a log file for persistence
  fs.appendFileSync('webview-bridge.log', logMessage + '\n');
}

// Set up a proxy server with special configuration for Replit
const proxy = createProxyServer({
  target: `http://localhost:${TARGET_PORT}`,
  ws: true,                 // Enable WebSocket support
  xfwd: true,               // Pass original client IP
  changeOrigin: true,       // Change the origin of the host header
  autoRewrite: true,        // Rewrite redirects to work with the proxy
  followRedirects: true     // Follow redirects inside the proxy
});

// Handle proxy errors gracefully
proxy.on('error', (err, req, res) => {
  log(`Proxy error: ${err.message}`);
  
  if (res.writeHead && !res.headersSent) {
    res.writeHead(502, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-MoodLync-Proxy-Error': 'true'
    });
    
    res.end(JSON.stringify({
      error: 'proxy_error',
      message: 'Cannot connect to the MoodLync application server',
      details: err.message,
      code: err.code || 'UNKNOWN_ERROR'
    }));
  }
});

// Create an HTTP server that proxies requests
const server = http.createServer((req, res) => {
  // Add comprehensive CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('X-MoodLync-Proxy', 'replit-webview-bridge');
  
  // Log incoming requests (except frequent ones)
  if (!req.url.includes('/health') && !req.url.includes('/favicon.ico')) {
    log(`${req.method} ${req.url} (from ${req.headers['x-forwarded-for'] || req.socket.remoteAddress})`);
  }
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Special handling for health checks from Replit
  if (req.url === '/' || req.url === '/health') {
    // Add additional headers to help debug Replit connectivity
    res.setHeader('X-MoodLync-Webview-Bridge', 'active');
    res.setHeader('X-MoodLync-Target', `http://localhost:${TARGET_PORT}`);
  }
  
  // Forward the request to our app server
  proxy.web(req, res, {}, (err) => {
    log(`Failed to proxy request: ${err.message}`);
    
    if (!res.headersSent) {
      res.writeHead(502, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      
      res.end(JSON.stringify({
        error: 'connection_error',
        message: 'Cannot connect to the MoodLync application',
        action: 'Please wait for the application server to start'
      }));
    }
  });
});

// Properly handle WebSocket upgrade requests for real-time features
server.on('upgrade', (req, socket, head) => {
  log(`WebSocket upgrade request: ${req.url}`);
  
  proxy.ws(req, socket, head, (err) => {
    if (err) {
      log(`WebSocket proxy error: ${err.message}`);
      socket.end();
    }
  });
});

// Start the server on the HTTPS port and bind to all network interfaces
try {
  server.listen(WEBVIEW_PORT, BIND_ADDRESS, () => {
    log(`✅ MoodLync Webview Bridge running on port ${WEBVIEW_PORT}`);
    log(`✅ Forwarding all requests to http://localhost:${TARGET_PORT}`);
    log(`✅ WebSocket forwarding enabled for real-time features`);
    
    // Create a PID file for easier management
    fs.writeFileSync('webview-bridge.pid', process.pid.toString());
  });
} catch (err) {
  log(`⚠️ Failed to start webview bridge: ${err.message}`);
  
  // Common error in Replit: port 443 requires elevated privileges
  if (err.code === 'EACCES') {
    log(`Port ${WEBVIEW_PORT} requires elevated privileges. Try using port 3000 instead.`);
    
    // Attempt to listen on port 3000 as a fallback
    try {
      server.listen(3000, BIND_ADDRESS, () => {
        log(`✅ MoodLync Webview Bridge running on fallback port 3000`);
        log(`✅ Forwarding all requests to http://localhost:${TARGET_PORT}`);
        
        // Create a PID file for easier management
        fs.writeFileSync('webview-bridge.pid', process.pid.toString());
      });
    } catch (fallbackErr) {
      log(`❌ Fatal error: Could not start webview bridge on fallback port: ${fallbackErr.message}`);
      process.exit(1);
    }
  }
}

// Graceful shutdown to prevent hanging connections
process.on('SIGINT', () => {
  log('Shutting down Webview Bridge...');
  server.close(() => {
    log('Webview Bridge stopped');
    process.exit(0);
  });
});