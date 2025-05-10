/**
 * ESM Port Forwarder for MoodLync
 * 
 * This module provides port forwarding capability using ES modules syntax
 * to be compatible with our TypeScript setup.
 */

import * as http from 'http';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { Agent } from 'http';

// Configuration
const TARGET_PORT = 5000;
const WEBVIEW_PORT = 3000;
const BIND_ADDRESS = '0.0.0.0'; // Bind to all interfaces for Replit compatibility

// Log with timestamp
function log(message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [ESM-Forward] ${message}`);
}

// Forward a request to the target server
function forwardRequest(
  req: IncomingMessage, 
  res: ServerResponse,
  targetPort: number
): void {
  const options = {
    hostname: 'localhost',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: req.headers,
    agent: new Agent({ keepAlive: true })
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Copy status code and headers
    res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
    
    // Stream the response data
    proxyRes.pipe(res);
  });

  // Forward request body if present
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }

  // Handle errors
  proxyReq.on('error', (err) => {
    log(`Error forwarding request: ${err.message}`);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Bad Gateway',
        message: 'Failed to connect to MoodLync application server',
        details: err.message
      }));
    }
  });
}

// Create a basic HTTP server that forwards requests
export function startESMPortForwarder(): Server {
  log(`Starting ESM Port Forwarder...`);
  
  const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    // Add replit specific header for webview
    res.setHeader('X-Replit-Webview-Marker', 'true');
    
    // Basic health check endpoint
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        message: 'MoodLync ESM Port Forwarder is running',
        forwarding_to: TARGET_PORT,
        timestamp: new Date().toISOString()
      }));
      return;
    }
    
    // Log requests (except for common ones)
    if (!req.url?.includes('/health') && !req.url?.includes('/favicon.ico')) {
      log(`Forwarding ${req.method} ${req.url}`);
    }
    
    // Forward all other requests
    forwardRequest(req, res, TARGET_PORT);
  });
  
  // Start the server
  server.listen(WEBVIEW_PORT, BIND_ADDRESS, () => {
    log(`✅ ESM Port Forwarder running on port ${WEBVIEW_PORT}`);
    log(`✅ Forwarding requests to application on port ${TARGET_PORT}`);
  });
  
  // Handle server errors
  server.on('error', (err) => {
    log(`Server error: ${err.message}`);
  });
  
  return server;
}