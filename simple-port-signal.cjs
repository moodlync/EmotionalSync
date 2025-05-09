/**
 * Simple Port Signal for Replit Preview
 * 
 * This script creates a minimal HTTP server on port 5000 that
 * simply responds with a redirect to port 5001.
 * 
 * This is the simplest solution to make the Replit preview work.
 */

const http = require('http');

console.log('🚀 Starting Simple Port Signal for Replit Preview');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Log the request
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Get the host without port
  const host = req.headers.host.split(':')[0];
  
  // Respond with a redirect to port 5001
  res.writeHead(302, {
    'Location': `http://${host}:5001${req.url}`
  });
  res.end();
});

// Start the server
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ Port signal running on port 5000');
  console.log('✅ Redirecting all requests to port 5001');
  
  // Output periodic health checks to keep the workflow alive
  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Port signal active on port 5000`);
  }, 60000); // Every minute
});

// Handle errors
server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.log('Port 5000 is already in use by another process');
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down port signal...');
  server.close(() => {
    console.log('Port signal closed');
    process.exit(0);
  });
});