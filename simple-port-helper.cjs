/**
 * Simple Port Helper for Replit Preview
 * 
 * This script creates a basic HTTP server on port 5000 that
 * redirects requests to the main application on port 5001.
 */

const http = require('http');
const https = require('https');

// Create a server that listens on port 5000
const server = http.createServer((req, res) => {
  // Log the request
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Set up the options for the forward request
  const options = {
    hostname: 'localhost',
    port: 5001,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  // Create a proxy request to the main app
  const proxyReq = http.request(options, (proxyRes) => {
    // Set the same status code and headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Pipe the response data
    proxyRes.pipe(res);
  });
  
  // Handle errors in the proxy request
  proxyReq.on('error', (err) => {
    console.error(`Proxy request error: ${err.message}`);
    
    // If the main app is not available, send a custom page
    res.writeHead(503, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MoodLync - Starting...</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
              color: #333;
              line-height: 1.6;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              max-width: 500px;
            }
            h1 {
              margin-top: 0;
              color: #0070f3;
            }
            .spinner {
              width: 40px;
              height: 40px;
              margin: 20px auto;
              border: 4px solid rgba(0, 0, 0, 0.1);
              border-left-color: #0070f3;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
          <script>
            // Refresh the page every 5 seconds to check if the app is ready
            setTimeout(() => {
              window.location.reload();
            }, 5000);
          </script>
        </head>
        <body>
          <div class="container">
            <h1>MoodLync</h1>
            <p>The application is starting up. Please wait a moment...</p>
            <div class="spinner"></div>
          </div>
        </body>
      </html>
    `);
  });
  
  // If there's request data, forward it
  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Start the server
server.listen(5000, '0.0.0.0', () => {
  console.log('🚀 Port helper running on port 5000');
  console.log('✅ Forwarding requests to main application on port 5001');
  
  // Output periodic health checks to keep the workflow alive
  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Port helper active on port 5000`);
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
  console.log('Shutting down port helper...');
  server.close(() => {
    console.log('Port helper closed');
    process.exit(0);
  });
});