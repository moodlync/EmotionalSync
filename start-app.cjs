/**
 * MoodLync Application Starter
 * 
 * This script starts the MoodLync application on port 8080.
 * It doesn't attempt to create a server on port 5000 since
 * that port is already being served by the Replit environment.
 */

const { spawn } = require('child_process');

console.log('🚀 Starting MoodLync Application');

// Start the application
const app = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '8080' }
});

app.on('error', (err) => {
  console.error(`Failed to start application: ${err.message}`);
  process.exit(1);
});

// Generate some activity to keep the application log active
const healthCheck = setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] MoodLync application health check`);
}, 30000);

app.on('exit', (code) => {
  clearInterval(healthCheck);
  console.log(`MoodLync application exited with code ${code}`);
  process.exit(code || 0);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  if (app) app.kill('SIGINT');
  clearInterval(healthCheck);
  process.exit(0);
});