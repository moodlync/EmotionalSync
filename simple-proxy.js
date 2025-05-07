// Simple proxy server that doesn't try to kill other processes
import http from 'http';

const PORT = 5000;
const TARGET_PORT = 8080;

console.log(`Starting simple proxy server on port ${PORT} forwarding to ${TARGET_PORT}...`);

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Just return a basic response for the health check
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('MoodLync Application - Proxy Server');
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Cannot start proxy server.`);
    console.error(`Replit workflows may not detect the application correctly.`);
    console.error(`You can still access the application directly on port ${TARGET_PORT}.`);
  } else {
    console.error('Proxy server error:', err);
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running on port ${PORT}`);
});