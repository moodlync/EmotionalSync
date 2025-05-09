/**
 * Simple Port Helper for Replit
 * 
 * This script creates a very minimal HTTP server on port 5000
 * that Replit can detect for the workflow and preview.
 */

const http = require('http');

console.log('🚀 Starting Simple Port Helper for Replit on port 5000');

// Create a minimal HTTP server on port 5000
const server = http.createServer((req, res) => {
  console.log(`Request received on port 5000: ${req.url}`);

  // Return a basic HTML page with an iframe embedding the actual app
  res.writeHead(200, { 
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache'
  });
  
  // Get the current hostname from the request
  const hostname = req.headers.host.split(':')[0];
  
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MoodLync Application</title>
        <style>
          body, html { 
            margin: 0; 
            padding: 0; 
            height: 100%; 
            overflow: hidden;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
        </style>
      </head>
      <body>
        <iframe src="http://${hostname}:5001/" allow="microphone; camera"></iframe>
      </body>
    </html>
  `);
});

// Start the server
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ Port helper is running on port 5000');
  console.log('✅ Replit preview should now work correctly');
  
  // Output regular health checks to keep the connection active
  setInterval(() => {
    console.log(`[${new Date().toISOString()}] Port helper active on port 5000`);
  }, 30000); // Every 30 seconds
});

// Handle errors
server.on('error', (err) => {
  console.error(`Error in port helper: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.log('Port 5000 is already in use. This might be okay if another service is already using it.');
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down port helper...');
  server.close(() => {
    console.log('Port helper shut down successfully');
    process.exit(0);
  });
});