/**
 * Port forwarder module for MoodLync in Replit environment
 * This helps with proper routing in the Replit environment
 */

import http from 'http';
import { log } from './vite';

export function startPortForwarder() {
  // Setup port forwarding for Replit environment
  // Create two forwarders to support both workflow and webview
  setupPortForwarder(5000, 5173); // For Replit workflow (waitForPort)
  setupPortForwarder(3000, 5173); // For Replit WebView
  
  // Port constants kept for backward compatibility
  const REPLIT_PORT = 5000;
  const APP_PORT = 5173;
  
  return true;
}

function setupPortForwarder(fromPort: number, toPort: number) {
  
  try {
    const server = http.createServer((req, res) => {
      log(`Forwarding [${fromPort} → ${toPort}]: ${req.method} ${req.url}`, 'port-forward');
      
      // Handle CORS for browser requests
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
      
      // Forward the request to the actual application
      const options = {
        hostname: 'localhost',
        port: toPort,
        path: req.url,
        method: req.method,
        headers: req.headers
      };
      
      const proxyReq = http.request(options, (proxyRes) => {
        // Make sure we have a valid status code (default to 502 if undefined)
        const statusCode = proxyRes.statusCode || 502;
        res.writeHead(statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      
      proxyReq.on('error', (err) => {
        log(`Proxy error: ${err.message}`, 'port-forward');
        res.writeHead(502, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head>
              <title>MoodLync - Service Unavailable</title>
              <style>
                body {
                  font-family: system-ui, sans-serif;
                  background: linear-gradient(135deg, #6366F1, #4F46E5);
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  margin: 0;
                  padding: 20px;
                  text-align: center;
                }
                .container {
                  max-width: 600px;
                  background-color: rgba(0, 0, 0, 0.2);
                  border-radius: 16px;
                  padding: 30px;
                  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Service Temporarily Unavailable</h1>
                <p>We're having trouble connecting to the MoodLync application.</p>
                <p>Error: ${err.message}</p>
                <p>Please try refreshing the page in a few moments.</p>
              </div>
            </body>
          </html>
        `);
      });
      
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        req.pipe(proxyReq);
      } else {
        proxyReq.end();
      }
    });
    
    // Start the server
    server.listen(fromPort, '0.0.0.0', () => {
      log(`Port forwarder running at http://0.0.0.0:${fromPort}`, 'port-forward');
      log(`Forwarding requests from port ${fromPort} to port ${toPort}`, 'port-forward');
    });
    
    // Handle server errors
    server.on('error', (err: NodeJS.ErrnoException) => {
      log(`Port forwarder error: ${err.message}`, 'port-forward');
      
      if (err.code === 'EADDRINUSE') {
        log(`Port ${fromPort} already in use, assuming another forwarder is running`, 'port-forward');
      }
    });
    
    return server;
  } catch (error: unknown) {
    // Safe error handling for unknown error types
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Failed to start port forwarder ${fromPort} → ${toPort}: ${errorMessage}`, 'port-forward');
    return null;
  }
}