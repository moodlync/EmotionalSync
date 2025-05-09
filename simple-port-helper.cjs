/**
 * Simple Port Helper for Replit Workflow
 * 
 * This minimal script creates an HTTP server on port 5000
 * to help the Replit workflow detect our application.
 */

const http = require('http');
const fs = require('fs');

// Log file setup
const logStream = fs.createWriteStream('./port-helper.log', { flags: 'a' });
function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  logStream.write(logLine);
  console.log(logLine.trim());
}

// Create a simple HTTP server on port 5000
try {
  log('Starting simple port helper on port 5000...');
  
  const server = http.createServer((req, res) => {
    log(`Received request: ${req.method} ${req.url}`);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('MoodLync application is running. Please visit port 8080 for the full application.');
  });
  
  // Handle errors
  server.on('error', (err) => {
    log(`ERROR: ${err.message}`);
    if (err.code === 'EADDRINUSE') {
      log('Port 5000 is already in use. Exiting gracefully.');
      process.exit(0);
    } else {
      process.exit(1);
    }
  });
  
  // Start listening
  server.listen(5000, '0.0.0.0', () => {
    log('✅ Successfully listening on port 5000');
    
    // Regular health check
    setInterval(() => {
      log('Port helper is still active on port 5000');
    }, 10000);
  });
  
  // Prevent the process from exiting
  process.stdin.resume();
  
  // Handle termination
  process.on('SIGINT', () => {
    log('Received SIGINT signal. Shutting down...');
    server.close(() => {
      log('Server closed successfully');
      process.exit(0);
    });
  });
  
  log('Port helper initialization complete');
} catch (error) {
  log(`FATAL ERROR: ${error.message}`);
  process.exit(1);
}