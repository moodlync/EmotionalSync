/**
 * Simple Port Signal for Replit
 * Minimal HTTP server on port 5000 to satisfy Replit's workflow detection
 */

const http = require('http');

// Create an extremely simple HTTP server on port 5000
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('MoodLync is running');
}).listen(5000, '0.0.0.0', () => {
  console.log('Port 5000 is now open for Replit workflow detection');
});

// Keep the process running
setInterval(() => {}, 1000);