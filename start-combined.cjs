/**
 * Combined starter script for MoodLync
 * This script starts both the application and the port forwarder
 */

const { spawn } = require('child_process');
const http = require('http');

// Port configuration
const REPLIT_PORT = 3000;  // Replit WebView expects this port
const APP_PORT = 5173;     // Our application runs on this port 

// Log timestamp prefix
function getTimestamp() {
  return new Date().toISOString();
}

function log(message) {
  console.log(`[${getTimestamp()}] ${message}`);
}

// Start the app
log('Starting MoodLync application...');
const appProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    PORT: APP_PORT.toString()
  }
});

appProcess.on('error', (err) => {
  log(`Failed to start application: ${err.message}`);
  process.exit(1);
});

// Give the app a moment to start before setting up the forwarder
setTimeout(() => {
  // Create a proxy server
  log('Starting port forwarder...');
  const server = http.createServer((req, res) => {
    log(`Forwarding: ${req.method} ${req.url}`);
    
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
      port: APP_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      // Make sure we have a valid status code
      const statusCode = proxyRes.statusCode || 502;
      res.writeHead(statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      log(`Proxy error: ${err.message}`);
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
  server.listen(REPLIT_PORT, '0.0.0.0', () => {
    log(`Port forwarder running at http://0.0.0.0:${REPLIT_PORT}`);
    log(`Forwarding requests from port ${REPLIT_PORT} to port ${APP_PORT}`);
  });
  
  // Handle server errors
  server.on('error', (err) => {
    log(`Server error: ${err.message}`);
    
    if (err.code === 'EADDRINUSE') {
      log(`Port ${REPLIT_PORT} already in use. Please check for other running processes.`);
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    log('Shutting down...');
    server.close();
    appProcess.kill();
    process.exit(0);
  });
  
}, 3000); // Wait 3 seconds before starting the forwarder

log('Combined startup script is running...');