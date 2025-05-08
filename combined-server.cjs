/**
 * MoodLync Combined Server
 * 
 * This script starts both the main application and a workflow signal server.
 * It addresses the Replit workflow port detection issue.
 * 
 * Usage: node combined-server.js
 */

const { spawn } = require('child_process');
const http = require('http');
const net = require('net');

console.log('🚀 Starting MoodLync Combined Server');

// First, check if port 5000 is already in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => {
        // Port is in use
        resolve(true);
      })
      .once('listening', () => {
        // Port is available
        tester.close();
        resolve(false);
      })
      .listen(port);
  });
}

// Function to create a signal server on port 5000
function startSignalServer() {
  console.log('Starting workflow signal server on port 5000...');
  
  const server = http.createServer((req, res) => {
    console.log(`Signal server received: ${req.method} ${req.url}`);
    
    // Set CORS headers to allow requests from any origin
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    // Redirect to the main application
    if (req.url === '/' || req.url.startsWith('/?')) {
      res.writeHead(302, { 'Location': 'http://localhost:8080' });
      res.end();
      return;
    }
    
    // For other requests, send a simple message
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('MoodLync is running on port 8080. Redirecting you there...');
  });

  server.listen(5000, '0.0.0.0', () => {
    console.log('✅ Workflow signal server running on port 5000');
    console.log('✅ This helps Replit workflow detect that the application is running');
  });

  server.on('error', (err) => {
    console.error(`❌ Failed to start workflow signal server: ${err.message}`);
  });
  
  return server;
}

// Function to start the main application
function startMainApplication() {
  console.log('Starting main MoodLync application...');
  
  const app = spawn('npm', ['run', 'dev'], {
    env: { ...process.env, PORT: '8080' },
    stdio: 'inherit'
  });
  
  app.on('error', (err) => {
    console.error(`❌ Failed to start main application: ${err.message}`);
  });
  
  app.on('exit', (code, signal) => {
    if (code !== 0) {
      console.error(`❌ Main application exited with code ${code} and signal ${signal}`);
    }
  });
  
  return app;
}

// Function to create a connection to port 5000 if it's already in use
function connectToExistingPort5000() {
  console.log('Port 5000 is already in use. Attempting to work with existing server...');
  
  // Create a socket to connect to port 5000 to verify it's active
  const socket = new net.Socket();
  
  socket.on('error', (err) => {
    console.error(`❌ Failed to connect to existing server on port 5000: ${err.message}`);
  });
  
  socket.connect(5000, 'localhost', () => {
    console.log('✅ Successfully connected to existing server on port 5000');
    console.log('✅ Replit workflow should detect this connection');
    socket.end();
  });
  
  // Keep checking the connection periodically
  const interval = setInterval(() => {
    const healthCheck = new net.Socket();
    healthCheck.connect(5000, 'localhost', () => {
      console.log('✓ Port 5000 is still active');
      healthCheck.end();
    });
    healthCheck.on('error', () => {
      console.error('❌ Port 5000 is no longer responding!');
    });
  }, 30000); // Check every 30 seconds
  
  return interval;
}

// Main function
async function main() {
  // Check if port 5000 is in use
  const port5000InUse = await isPortInUse(5000);
  
  let signalServer = null;
  let mainApp = null;
  let healthCheck = null;
  
  // Start the main application regardless
  mainApp = startMainApplication();
  
  // If port 5000 is not in use, start our signal server
  if (!port5000InUse) {
    signalServer = startSignalServer();
  } else {
    // If port 5000 is in use, try to work with it
    healthCheck = connectToExistingPort5000();
  }
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down all services...');
    
    if (signalServer) {
      signalServer.close();
    }
    
    if (mainApp) {
      mainApp.kill();
    }
    
    if (healthCheck) {
      clearInterval(healthCheck);
    }
    
    process.exit(0);
  });
}

// Run the main function
main().catch(err => {
  console.error('❌ Combined server failed:', err);
});