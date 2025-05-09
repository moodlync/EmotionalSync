/**
 * MoodLync Workflow Helper
 * 
 * This script starts a port listener on port 5000 to help Replit's workflow
 * detect our application which runs on port 8080.
 * 
 * Run this helper before or alongside the main application to ensure proper
 * workflow detection.
 */

const http = require('http');
const fs = require('fs');

// Create a log file
const logFile = fs.createWriteStream('./workflow-helper.log', { flags: 'a' });
const logTimestamp = () => new Date().toISOString();

// Redirect console output to both console and log file
const originalConsoleLog = console.log;
console.log = function() {
  const args = Array.from(arguments);
  const timestamp = `[${logTimestamp()}] `;
  
  originalConsoleLog.apply(console, [timestamp, ...args]);
  logFile.write(timestamp + args.join(' ') + '\n');
};

console.error = function() {
  const args = Array.from(arguments);
  const timestamp = `[${logTimestamp()}] ERROR: `;
  
  originalConsoleLog.apply(console, [timestamp, ...args]);
  logFile.write(timestamp + args.join(' ') + '\n');
};

console.log('🚀 Starting MoodLync Workflow Helper');

// Create a simple HTTP server on port 5000 for Replit workflow detection
const server = http.createServer((req, res) => {
  res.writeHead(200, { 
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  res.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MoodLync - Application Running</title>
        <meta http-equiv="refresh" content="0;url=http://${req.headers.host.replace('5000', '8080')}" />
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          h1 { color: #4F46E5; }
          p { margin: 20px 0; }
          .redirect { color: #9333EA; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>MoodLync Application</h1>
        <p>The application is running on port 8080.</p>
        <p class="redirect">Redirecting you to the main application...</p>
        <script>
          window.location.href = "http://" + window.location.host.replace('5000', '8080');
        </script>
      </body>
    </html>
  `);
  res.end();
});

// Start the server on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ Successfully started workflow helper on port 5000');
  console.log('✅ Replit workflow should now detect the application');
  
  // Keep the console active with periodic messages
  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Workflow helper active on port 5000`);
  }, 5000);
});

// Handle server errors
server.on('error', (error) => {
  console.error(`❌ Error starting workflow helper: ${error.message}`);
  
  if (error.code === 'EADDRINUSE') {
    console.log('Port 5000 is already in use. This may be fine if another helper is running.');
    process.exit(0);
  } else {
    process.exit(1);
  }
});

// Keep the process running indefinitely
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down workflow helper...');
  server.close(() => {
    console.log('Workflow helper shut down successfully');
    process.exit(0);
  });
});