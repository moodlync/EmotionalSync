/**
 * Advanced Port Forwarder for MoodLync
 * 
 * This script creates a more robust HTTP proxy that forwards all traffic
 * from port 5000 to port 5001 to ensure Replit preview works correctly.
 * 
 * It also monitors the main application and restarts it if needed.
 */

const http = require('http');
const { spawn } = require('child_process');
const net = require('net');

// Configuration
const SOURCE_PORT = 5000;
const TARGET_PORT = 5001;
const CHECK_INTERVAL = 5000; // 5 seconds

console.log(`🚧 Starting Advanced Port Forwarder (${SOURCE_PORT} -> ${TARGET_PORT})`);

// Variable to track if the main app is running
let isAppRunning = false;

// Function to check if app is running on target port
function checkAppStatus() {
  const client = net.createConnection({ port: TARGET_PORT }, () => {
    // Connection successful, app is running
    client.end();
    if (!isAppRunning) {
      console.log(`✅ Main application detected on port ${TARGET_PORT}`);
      isAppRunning = true;
    }
  });
  
  client.on('error', (err) => {
    if (isAppRunning) {
      console.log(`❌ Main application not detected on port ${TARGET_PORT}: ${err.message}`);
      isAppRunning = false;
      
      // Attempt to start the app
      startMainApp();
    }
  });
}

// Function to start the main application
function startMainApp() {
  console.log('🚀 Attempting to start main application...');
  
  const appProcess = spawn('npm', ['run', 'dev'], {
    detached: true,
    stdio: 'ignore',
    env: { ...process.env, PORT: TARGET_PORT.toString() }
  });
  
  // Detach the process so it continues running after this script exits
  appProcess.unref();
  
  console.log(`🔄 Waiting for application to start on port ${TARGET_PORT}...`);
}

// Create HTTP proxy server
const proxyServer = http.createServer((req, res) => {
  // Forward the request to the target server
  const options = {
    hostname: 'localhost',
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `localhost:${TARGET_PORT}` }
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  // Handle proxy errors
  proxyReq.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    
    // Send a nice-looking error page
    res.writeHead(503, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MoodLync - Starting...</title>
          <meta http-equiv="refresh" content="3">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
              color: #333;
              line-height: 1.6;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              max-width: 500px;
            }
            h1 {
              margin-top: 0;
              color: #0070f3;
            }
            .spinner {
              width: 40px;
              height: 40px;
              margin: 20px auto;
              border: 4px solid rgba(0, 0, 0, 0.1);
              border-left-color: #0070f3;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>MoodLync</h1>
            <p>The application is starting up. Please wait a moment...</p>
            <div class="spinner"></div>
            <p><small>Automatically refreshing...</small></p>
          </div>
        </body>
      </html>
    `);
    
    // Check if the main app is running
    checkAppStatus();
  });
  
  // Forward request body if needed
  req.pipe(proxyReq, { end: true });
});

// Start the HTTP proxy server
try {
  proxyServer.listen(SOURCE_PORT, '0.0.0.0', () => {
    console.log(`✅ Port forwarder running on port ${SOURCE_PORT}`);
    console.log(`✅ Forwarding all traffic to port ${TARGET_PORT}`);
    
    // Check app status initially
    checkAppStatus();
    
    // Set up interval to periodically check if the main app is running
    setInterval(checkAppStatus, CHECK_INTERVAL);
    
    // Output periodic health checks to keep the workflow alive
    setInterval(() => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Port forwarder active (${SOURCE_PORT} -> ${TARGET_PORT})`);
    }, 60000); // Every minute
  });
} catch (err) {
  console.error(`Failed to start port forwarder: ${err.message}`);
  process.exit(1);
}

// Handle server errors
proxyServer.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${SOURCE_PORT} is already in use`);
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down port forwarder...');
  proxyServer.close(() => {
    console.log('Port forwarder closed');
    process.exit(0);
  });
});