/**
 * MoodLync Workflow Fix
 * 
 * This script is designed to handle the Replit workflow detection issue
 * by continuously checking if our main application is running on port 8080
 * and providing status updates to keep the workflow alive.
 */

const http = require('http');
const { spawn } = require('child_process');

console.log('🚀 Starting MoodLync Application with Workflow Fix');

// Start our main application
const app = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '8080' }
});

app.on('error', (err) => {
  console.error(`Failed to start application: ${err.message}`);
  process.exit(1);
});

// Function to check if our app is running
function checkAppStatus() {
  return new Promise((resolve) => {
    const req = http.request({
      host: 'localhost',
      port: 8080,
      path: '/',
      method: 'HEAD',
      timeout: 1000
    }, (res) => {
      resolve(res.statusCode < 400); // Consider 2xx and 3xx as success
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Output regular status messages to keep the workflow alive
let isAppRunning = false;
const CHECK_INTERVAL = 5000; // Check every 5 seconds

function outputStatus() {
  console.log(`[${new Date().toISOString()}] MoodLync application status: ${isAppRunning ? 'RUNNING' : 'STARTING...'}`);
  
  if (isAppRunning) {
    console.log('✅ Application is running on port 8080');
    console.log('✅ Visit http://localhost:8080 to access the application');
  } else {
    console.log('⏳ Application is starting up, please wait...');
  }

  // Check application status
  checkAppStatus().then(isRunning => {
    if (isRunning && !isAppRunning) {
      console.log('🎉 Application has successfully started!');
    } else if (!isRunning && isAppRunning) {
      console.log('⚠️ Application is no longer responding');
    }
    isAppRunning = isRunning;
  });
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('Shutting down...');
  app.kill('SIGINT');
  process.exit(0);
});

// Set up regular status checks
outputStatus();
setInterval(outputStatus, CHECK_INTERVAL);

// Keep the process alive
setInterval(() => {}, 60000);