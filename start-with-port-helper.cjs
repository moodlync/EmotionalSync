/**
 * MoodLync Startup with Port Helper
 * 
 * This script starts both the port helper (for Replit preview compatibility)
 * and the main MoodLync application.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MoodLync with Port Helper');

// First, start the port helper on port 5000
const portHelper = spawn('node', ['simple-port-helper.cjs'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Log port helper stdout/stderr to console with a prefix
portHelper.stdout.on('data', (data) => {
  console.log(`[PORT HELPER] ${data.toString().trim()}`);
});

portHelper.stderr.on('data', (data) => {
  console.error(`[PORT HELPER ERROR] ${data.toString().trim()}`);
});

// Handle port helper exit
portHelper.on('exit', (code) => {
  console.log(`Port helper exited with code ${code}`);
});

// Wait a moment to ensure port helper has started
setTimeout(() => {
  console.log('Starting main MoodLync application...');
  
  // Start the main application
  const app = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '5001' }
  });
  
  app.on('error', (err) => {
    console.error(`Failed to start MoodLync application: ${err.message}`);
    process.exit(1);
  });
  
  app.on('exit', (code) => {
    console.log(`MoodLync application exited with code ${code}`);
    // Kill the port helper when the main app exits
    portHelper.kill();
    process.exit(code || 0);
  });
}, 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  portHelper.kill('SIGINT');
  process.exit(0);
});