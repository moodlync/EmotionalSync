/**
 * MoodLync Starter
 * 
 * This script starts both the main MoodLync application and the workflow signal server
 * to ensure proper Replit workflow detection.
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const APP_PORT = 8080;
const WORKFLOW_PORT = 5000;

console.log('🚀 Starting MoodLync Combined Server');

// Start the workflow signal server first (for port 5000)
let signalServer;
try {
  console.log('Starting workflow signal server...');
  signalServer = spawn('node', ['workflow-signal.js'], {
    stdio: 'inherit'
  });
  
  signalServer.on('error', (err) => {
    console.error(`Failed to start workflow signal server: ${err.message}`);
  });
} catch (error) {
  console.error('Error starting workflow signal server:', error.message);
}

// Then start the main application (on port 8080)
try {
  console.log('Starting main MoodLync application...');
  
  // Start main application with npm run dev
  const app = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: APP_PORT.toString() }
  });
  
  app.on('error', (err) => {
    console.error(`Failed to start MoodLync application: ${err.message}`);
    
    // Kill the signal server if main app fails
    if (signalServer) {
      signalServer.kill();
    }
    
    process.exit(1);
  });
  
  app.on('exit', (code, signal) => {
    console.log(`MoodLync application exited with code ${code} and signal ${signal || 'none'}`);
    
    // Kill the signal server when main app exits
    if (signalServer) {
      signalServer.kill();
    }
    
    process.exit(code || 0);
  });
} catch (error) {
  console.error('Error starting MoodLync application:', error.message);
  
  // Kill the signal server if there's an error
  if (signalServer) {
    signalServer.kill();
  }
  
  process.exit(1);
}

// Handle process termination signals
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down...');
  
  if (signalServer) {
    signalServer.kill('SIGINT');
  }
  
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Shutting down...');
  
  if (signalServer) {
    signalServer.kill('SIGTERM');
  }
  
  process.exit(0);
});