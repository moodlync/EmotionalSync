// MoodLync Replit Webview Bridge
// This script provides a reliable bridge for Replit's webview to access our app on port 5000
import http from 'http';
import fs from 'fs';

// Configuration
const APP_PORT = 5000;
const WEBVIEW_PORT = 8080; // Using port 8080 instead of 3000 to avoid conflicts
const LOG_FILE = 'webview-bridge.log';

// Setup logging
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

// Log to both console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [WebViewBridge] ${message}`;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

log('Starting MoodLync Webview Bridge...');
log(`Forwarding port ${WEBVIEW_PORT} to application on port ${APP_PORT}`);

// Create a server that will forward requests to the main app
const server = http.createServer((req, res) => {
  const url = req.url;
  
  // Only log non-favicon requests to reduce noise
  if (!url.includes('favicon.ico')) {
    log(`Forwarding request: ${req.method} ${url}`);
  }
  
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-csrf-token');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Create options for the proxy request
  const options = {
    hostname: 'localhost',
    port: APP_PORT,
    path: url,
    method: req.method,
    headers: {...req.headers, host: `localhost:${APP_PORT}`}
  };
  
  // Create the proxy request
  const proxyReq = http.request(options, (proxyRes) => {
    // Forward the statusCode and headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Stream the response data back to the client
    proxyRes.pipe(res);
  });
  
  // Handle errors in the proxy request
  proxyReq.on('error', (err) => {
    log(`Proxy error: ${err.message}`);
    
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MoodLync - Service Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #6366F1, #4F46E5);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            background: rgba(0,0,0,0.2);
            border-radius: 16px;
            padding: 30px;
            text-align: center;
          }
          h1 {
            font-size: 1.8rem;
            margin-bottom: 1rem;
          }
          .error {
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            text-align: left;
            font-family: monospace;
            font-size: 0.9rem;
          }
          .logo {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          .logo span:first-child {
            color: white;
          }
          .logo span:last-child {
            color: #FEC89A;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo"><span>MOOD</span><span>LYNC</span></div>
          <h1>Service Temporarily Unavailable</h1>
          <p>We're currently experiencing connectivity issues reaching the MoodLync application.</p>
          <div class="error">
            <p>Error: ${err.message}</p>
            <p>The application may still be starting up. Please try again in a moment.</p>
          </div>
          <p>If this issue persists, please restart the application or contact support.</p>
        </div>
      </body>
      </html>
    `);
  });
  
  // Forward the request body if it's a POST, PUT or PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Handle server errors
server.on('error', (err) => {
  log(`Server error: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    log(`Port ${WEBVIEW_PORT} is already in use`);
    log('You may already have a port forwarder running');
    log('Try a different port or stop the existing forwarder');
    process.exit(1);
  }
});

// Start the server
server.listen(WEBVIEW_PORT, '0.0.0.0', () => {
  log(`✅ Webview bridge running on port ${WEBVIEW_PORT}`);
  log(`✅ Forwarding requests to application on port ${APP_PORT}`);
  log(`✅ Bridge is now ready to serve requests`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    logStream.end();
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    log('Server closed');
    logStream.end();
    process.exit(0);
  });
});