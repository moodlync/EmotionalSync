/**
 * MoodLync Combined Server Starter
 */

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting MoodLync Combined Server');

// Start the main application directly on port 5000
const mainApp = spawn('./node_modules/.bin/tsx', ['server/index.ts'], {
  env: { ...process.env, NODE_ENV: 'development', PORT: '5000' },
  stdio: 'inherit'
});

mainApp.on('error', (err) => {
  console.error('Failed to start main application:', err);
  process.exit(1);
});

// Handle cleanup
process.on('SIGINT', () => {
  mainApp.kill('SIGINT');
  process.exit(0);
});