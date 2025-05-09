/**
 * MoodLync Combined Server Starter
 */

const { spawn } = require('child_process');
const express = require('express');
const http = require('http');

console.log('🚀 Starting MoodLync Combined Server');

// Create a simple express app for port 5000
const app = express();
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('MoodLync server is running. Please visit port 8080 for the application.');
});

// Start the server on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ Signal server running on port 5000');
});

// Start the main application using npm run dev
const env = { ...process.env, PORT: '5000' };
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
  server.close();
  process.exit(0);
});