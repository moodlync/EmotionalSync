/**
 * MoodLync Combined Starter
 * 
 * This script starts both the Replit port helper (on port 5000)
 * and the main MoodLync application (on port 5001) in a single process.
 * 
 * It ensures that port 5000 is accessible for Replit workflow detection
 * while the actual application runs on port 5001.
 */

const http = require('http');
const { spawn } = require('child_process');

// Configuration
const REPLIT_PORT = 5000; // For Replit workflow detection
const APP_PORT = 5001;    // For the actual application

console.log('🚀 Starting MoodLync Combined Starter');

// Create the port signal server on port 5000
console.log(`Creating port signal server on port ${REPLIT_PORT}...`);

const signalServer = http.createServer((req, res) => {
  // Get hostname without port
  const hostname = req.headers.host ? req.headers.host.split(':')[0] : 'localhost';
  
  // Redirect to the actual application
  res.writeHead(302, {
    'Location': `http://${hostname}:${APP_PORT}${req.url}`
  });
  res.end();
});

signalServer.listen(REPLIT_PORT, '0.0.0.0', () => {
  console.log(`✅ Port signal server running on port ${REPLIT_PORT}`);
  
  // Now start the main application
  console.log('🚀 Starting main MoodLync application...');
  
  const appProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: APP_PORT.toString() }
  });
  
  appProcess.on('error', (error) => {
    console.error(`Failed to start application: ${error.message}`);
    process.exit(1);
  });
  
  appProcess.on('exit', (code) => {
    console.log(`Application exited with code ${code}`);
    // Close the signal server when the main app exits
    signalServer.close();
    process.exit(code || 0);
  });
  
  // Output health check messages periodically to keep the workflow alive
  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] MoodLync running - signal:${REPLIT_PORT}, app:${APP_PORT}`);
  }, 60000); // Every minute
});

signalServer.on('error', (err) => {
  console.error(`Signal server error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${REPLIT_PORT} is already in use!`);
    console.log('Trying to start only the main application...');
    
    // Start just the main application if the signal port is already in use
    const appProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      env: { ...process.env, PORT: APP_PORT.toString() }
    });
    
    appProcess.on('error', (error) => {
      console.error(`Failed to start application: ${error.message}`);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  signalServer.close();
  process.exit(0);
});