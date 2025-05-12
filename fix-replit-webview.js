// Fix Replit Webview for MoodLync
// This is a specialized solution for the Replit environment
const http = require('http');
const fs = require('fs');

// Configuration
const APP_PORT = 5000;
const WEBVIEW_PORT = 3000;
const LOG_FILE = 'replit-webview-fix.log';

// Set up logging
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

log('=== MoodLync Replit Webview Fix ===');
log(`Starting server on port ${WEBVIEW_PORT}, redirecting to application on port ${APP_PORT}`);

// Create a simple HTML page that redirects to the actual app
const redirectHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MoodLync - Redirecting</title>
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
      text-align: center;
    }
    .container {
      max-width: 600px;
      background: rgba(0,0,0,0.2);
      border-radius: 16px;
      padding: 30px;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    .loader {
      display: inline-block;
      width: 50px;
      height: 50px;
      border: 5px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .btn {
      display: inline-block;
      background: white;
      color: #4F46E5;
      padding: 10px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 20px;
      transition: all 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
  </style>
  <script>
    // Attempt to redirect to the MoodLync app
    function tryRedirect() {
      window.location.href = 'http://localhost:${APP_PORT}/';
    }
    
    // Start redirect after a short delay
    setTimeout(tryRedirect, 1500);
  </script>
</head>
<body>
  <div class="container">
    <h1>MoodLync</h1>
    <div class="loader"></div>
    <p>Redirecting you to the MoodLync application...</p>
    <p>If you aren't redirected automatically, please click the button below:</p>
    <a href="http://localhost:${APP_PORT}/" class="btn">Open MoodLync</a>
  </div>
</body>
</html>
`;

// Create the server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  if (req.url === '/' || req.url === '/index.html') {
    // Serve redirect page for the root path
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(redirectHtml);
    log(`Served redirect page to ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
  } else if (req.url === '/api/health' || req.url === '/health' || req.url === '/api/heartbeat') {
    // Health check endpoint
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'MoodLync Replit Webview Fix is running',
      redirectingTo: `http://localhost:${APP_PORT}`
    }));
  } else {
    // For all other requests, redirect to the app
    res.writeHead(302, { 'Location': `http://localhost:${APP_PORT}${req.url}` });
    res.end();
    log(`Redirected request for ${req.url} to application`);
  }
});

// Handle server errors
server.on('error', (err) => {
  log(`Server error: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    log(`Port ${WEBVIEW_PORT} is already in use`);
    log('Trying to use a different port...');
    
    // Try using port 8080 instead
    server.listen(8080, '0.0.0.0');
  }
});

// Start the server
server.listen(WEBVIEW_PORT, '0.0.0.0', () => {
  log(`✅ Server running on port ${WEBVIEW_PORT}`);
  log(`✅ Redirecting all requests to application on port ${APP_PORT}`);
  
  // Create a PID file for easier process management
  fs.writeFileSync('replit-webview-fix.pid', process.pid.toString());
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('Received SIGINT signal, shutting down...');
  server.close(() => {
    log('Server closed');
    logStream.end();
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  log('Received SIGTERM signal, shutting down...');
  server.close(() => {
    log('Server closed');
    logStream.end();
    process.exit(0);
  });
});