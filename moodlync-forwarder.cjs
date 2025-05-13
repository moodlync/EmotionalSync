/**
 * MoodLync Port Forwarder
 * Simple standalone HTTP proxy for the Replit environment
 */

const http = require('http');

// Configuration
const FROM_PORT = 3000;  // Replit WebView expects this port
const TO_PORT = 5173;    // Our application runs on this port
const HOST = '0.0.0.0';  // Listen on all interfaces

// Log with timestamps
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Create the proxy server
const server = http.createServer((req, res) => {
  log(`Forwarding: ${req.method} ${req.url}`);
  
  // Handle CORS for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Forward the request to the actual application
  const options = {
    hostname: 'localhost',
    port: TO_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    // Make sure we have a valid status code
    const statusCode = proxyRes.statusCode || 502;
    res.writeHead(statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    log(`Proxy error: ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>MoodLync - Service Unavailable</title>
          <style>
            body {
              font-family: system-ui, sans-serif;
              background: linear-gradient(135deg, #6366F1, #4F46E5);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .container {
              max-width: 600px;
              background-color: rgba(0, 0, 0, 0.2);
              border-radius: 16px;
              padding: 30px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Service Temporarily Unavailable</h1>
            <p>We're having trouble connecting to the MoodLync application.</p>
            <p>Error: ${err.message}</p>
            <p>Please try refreshing the page in a few moments.</p>
          </div>
        </body>
      </html>
    `);
  });
  
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Handle errors
server.on('error', (err) => {
  log(`Server error: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    log(`Port ${FROM_PORT} already in use. Please check for other running processes.`);
    process.exit(1);
  }
});

// Start the server
server.listen(FROM_PORT, HOST, () => {
  log(`MoodLync Forwarder running at http://${HOST}:${FROM_PORT}`);
  log(`Forwarding requests to http://localhost:${TO_PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  log('Server shutting down...');
  server.close(() => {
    log('Server stopped');
    process.exit(0);
  });
});