// Simple and direct port forwarder for Replit webview
import http from 'http';
import { exec } from 'child_process';

// Configuration
const APP_PORT = 5000; // The main application port
const WEBVIEW_PORT = 8080; // Use a different port than 3000 to avoid conflicts

console.log(`Starting simple port forwarder for Replit webview...`);
console.log(`Redirecting requests from port ${WEBVIEW_PORT} to port ${APP_PORT}`);

// Create a simple HTTP server
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
  
  // Log the incoming request (except for common ones)
  if (!req.url.includes('/favicon.ico')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  
  // For the root path, serve a simple HTML page
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MoodLync - Redirecting</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #6366F1, #4F46E5);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            padding: 40px;
            background: rgba(0,0,0,0.2);
            border-radius: 16px;
            backdrop-filter: blur(10px);
          }
          h1 {
            margin-top: 0;
            font-size: 2.5rem;
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 20px;
            font-size: 1.2rem;
            line-height: 1.5;
          }
          .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #4F46E5;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 2s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>MoodLync</h1>
          <div class="loader"></div>
          <p>We're connecting you to the MoodLync application...</p>
          <p id="status">Checking connection to the server...</p>
          <script>
            // Try to connect to the application directly
            setTimeout(() => {
              document.getElementById('status').textContent = 'Redirecting to application...';
              window.location.href = 'http://localhost:5000';
            }, 2000);
          </script>
        </div>
      </body>
      </html>
    `);
    return;
  }
  
  // For everything else, proxy the request to the application
  const options = {
    hostname: 'localhost',
    port: APP_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error(`Error forwarding request: ${err.message}`);
    
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>MoodLync - Connection Error</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #6366F1, #4F46E5);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            padding: 40px;
            background: rgba(0,0,0,0.2);
            border-radius: 16px;
            backdrop-filter: blur(10px);
          }
          h1 {
            margin-top: 0;
            font-size: 2.5rem;
            margin-bottom: 20px;
          }
          p {
            margin-bottom: 20px;
            font-size: 1.2rem;
            line-height: 1.5;
          }
          .error {
            background: rgba(255,0,0,0.1);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Connection Error</h1>
          <div class="error">
            <p>We couldn't connect to the MoodLync application server.</p>
            <p>Error: ${err.message}</p>
          </div>
          <p>Please make sure the application server is running on port ${APP_PORT}.</p>
        </div>
      </body>
      </html>
    `);
  });
  
  if (req.method === 'POST' || req.method === 'PUT') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// Start the server
server.listen(WEBVIEW_PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${WEBVIEW_PORT}`);
  console.log(`Forwarding requests to http://localhost:${APP_PORT}`);
});

// Handle errors
server.on('error', (err) => {
  console.error(`Server error: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${WEBVIEW_PORT} is already in use.`);
    console.error('Trying an alternative approach...');
    
    // Kill processes that might be using port 3000
    exec(`kill -9 $(lsof -t -i:${WEBVIEW_PORT})`, (error) => {
      if (error) {
        console.error(`Failed to kill processes: ${error.message}`);
      } else {
        console.log(`Killed processes using port ${WEBVIEW_PORT}`);
        console.log('Waiting a moment before retrying...');
        
        // Try again after a short delay
        setTimeout(() => {
          server.listen(WEBVIEW_PORT, '0.0.0.0');
        }, 1000);
      }
    });
  }
});