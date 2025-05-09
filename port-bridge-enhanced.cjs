#!/usr/bin/env node

/**
 * Enhanced Port Bridge for MoodLync
 * 
 * This script creates a robust HTTP proxy that forwards requests from port 5000
 * (expected by Replit workflows) to port 8080 (where the MoodLync app runs).
 * 
 * The bridge includes error handling, automatic retry, and websocket support
 * to ensure a seamless user experience in the Replit environment.
 */

const http = require('http');
const https = require('https');
const WebSocket = require('ws');

const BRIDGE_PORT = 5000;
const TARGET_PORT = 8080;

// Terminal colors for better readability
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

// WebSocket server to handle WS connections
let wsServer;

// Handle regular HTTP requests by proxying them to the target port
function handleHttpRequest(req, res) {
  console.log(`${colors.blue}[Bridge]${colors.reset} Proxying ${req.method} request from port ${BRIDGE_PORT} to ${TARGET_PORT}: ${req.url}`);
  
  const options = {
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  // Update host header to match target
  options.headers.host = `localhost:${TARGET_PORT}`;
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  proxyReq.on('error', (err) => {
    console.error(`${colors.red}[Bridge] Proxy error:${colors.reset}`, err.message);
    
    if (!res.headersSent) {
      res.writeHead(502, {'Content-Type': 'text/html'});
      res.end(`
        <html>
          <head>
            <title>MoodLync - Service Connecting</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                text-align: center;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                max-width: 500px;
                width: 90%;
              }
              h1 {
                margin-top: 0;
                color: #333;
              }
              .status {
                margin: 1.5rem 0;
                font-size: 1.1rem;
                color: #666;
              }
              .loader {
                display: inline-block;
                width: 50px;
                height: 50px;
                border: 5px solid rgba(0,128,255,0.2);
                border-radius: 50%;
                border-top-color: rgba(0,128,255,1);
                animation: spin 1s ease-in-out infinite;
              }
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              .info {
                font-size: 0.9rem;
                color: #888;
                margin-top: 2rem;
              }
            </style>
            <script>
              // Auto-refresh the page after 3 seconds
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            </script>
          </head>
          <body>
            <div class="container">
              <h1>MoodLync</h1>
              <div class="status">Connecting to the application...</div>
              <div class="loader"></div>
              <div class="info">
                The application is starting up. This page will automatically refresh.
              </div>
            </div>
          </body>
        </html>
      `);
    }
  });
  
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.pipe(proxyReq, { end: true });
  } else {
    proxyReq.end();
  }
}

// Create and start the HTTP server
function startBridgeServer() {
  const server = http.createServer(handleHttpRequest);
  
  server.listen(BRIDGE_PORT, '0.0.0.0', () => {
    console.log(`${colors.green}[Bridge] Running on port ${BRIDGE_PORT}${colors.reset} - Forwarding to port ${TARGET_PORT}`);
    console.log(`${colors.cyan}[Bridge] This helps Replit detect the application correctly${colors.reset}`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`${colors.yellow}[Bridge] Port ${BRIDGE_PORT} is already in use.${colors.reset}`);
      console.log(`${colors.blue}[Bridge] This likely means another port bridge is already running.${colors.reset}`);
      process.exit(0);
    } else {
      console.error(`${colors.red}[Bridge] Server error:${colors.reset}`, err.message);
    }
  });
  
  // Setup WebSocket server to pass through WS connections
  wsServer = new WebSocket.Server({ server });
  
  wsServer.on('connection', (ws, req) => {
    console.log(`${colors.magenta}[Bridge] WebSocket connection received${colors.reset}`);
    
    const targetWs = new WebSocket(`ws://localhost:${TARGET_PORT}${req.url}`);
    
    targetWs.on('open', () => {
      console.log(`${colors.green}[Bridge] WebSocket connected to target${colors.reset}`);
      
      // Forward messages from client to target
      ws.on('message', (message) => {
        targetWs.send(message);
      });
      
      // Forward messages from target to client
      targetWs.on('message', (message) => {
        ws.send(message);
      });
      
      // Handle WebSocket closures
      ws.on('close', () => {
        console.log(`${colors.yellow}[Bridge] Client WebSocket closed${colors.reset}`);
        targetWs.close();
      });
      
      targetWs.on('close', () => {
        console.log(`${colors.yellow}[Bridge] Target WebSocket closed${colors.reset}`);
        ws.close();
      });
    });
    
    targetWs.on('error', (err) => {
      console.error(`${colors.red}[Bridge] Target WebSocket error:${colors.reset}`, err.message);
      ws.close();
    });
  });
  
  return server;
}

// Health check to verify the target application is running
function checkTargetHealth() {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${TARGET_PORT}/`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          healthy: res.statusCode >= 200 && res.statusCode < 500
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({ healthy: false, error: err.message });
    });
    
    req.setTimeout(2000, () => {
      req.abort();
      resolve({ healthy: false, error: 'Timeout' });
    });
  });
}

// Main function
async function main() {
  console.log(`\n${colors.cyan}=== MoodLync Port Bridge ===\n${colors.reset}`);
  console.log(`${colors.blue}[Bridge] Checking if target application is running on port ${TARGET_PORT}...${colors.reset}`);
  
  const health = await checkTargetHealth();
  
  if (health.healthy) {
    console.log(`${colors.green}[Bridge] Target application is running! Status: ${health.status}${colors.reset}`);
    startBridgeServer();
  } else {
    console.log(`${colors.yellow}[Bridge] Target application is not responding. ${health.error || ''}${colors.reset}`);
    console.log(`${colors.blue}[Bridge] Starting bridge server anyway - will serve temporary page${colors.reset}`);
    startBridgeServer();
    
    // Periodically check if the target application comes online
    console.log(`${colors.blue}[Bridge] Will check every 5 seconds if target comes online${colors.reset}`);
    
    const interval = setInterval(async () => {
      const checkHealth = await checkTargetHealth();
      if (checkHealth.healthy) {
        console.log(`${colors.green}[Bridge] Target application is now online! Status: ${checkHealth.status}${colors.reset}`);
        clearInterval(interval);
      }
    }, 5000);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}[Bridge] Shutting down port bridge${colors.reset}`);
  if (wsServer) {
    wsServer.close();
  }
  process.exit(0);
});

// Start the bridge
main();