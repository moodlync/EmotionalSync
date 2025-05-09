/**
 * Workflow Helper for Replit Preview
 * 
 * This script helps connect port 5000 to the main application
 * to ensure that Replit preview works correctly.
 */

const http = require('http');
const { spawn } = require('child_process');

// First, check if our application is already running on port 5001
console.log('🔄 Checking for running application on port 5001...');

const checkApp = http.request({
  host: 'localhost',
  port: 5001,
  path: '/',
  method: 'HEAD',
  timeout: 1000
}, (res) => {
  console.log(`✅ Application detected on port 5001 (status: ${res.statusCode})`);
  startPortHelper();
});

checkApp.on('error', (err) => {
  console.log(`❌ No application detected on port 5001: ${err.message}`);
  console.log('🚀 Starting main application on port 5001...');
  
  const app = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '5001' }
  });
  
  app.on('error', (appErr) => {
    console.error(`Failed to start application: ${appErr.message}`);
    process.exit(1);
  });
  
  // Give the app a moment to start before starting the port helper
  setTimeout(startPortHelper, 2000);
});

checkApp.end();

function startPortHelper() {
  console.log('🚀 Starting port helper on port 5000 for Replit preview...');
  
  // Create a minimal HTTP server on port 5000
  const server = http.createServer((req, res) => {
    console.log(`Request received on port 5000: ${req.url}`);
    
    // Return a basic HTML page with an iframe
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
    
    // Output periodic health checks to keep the workflow alive
    setInterval(() => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] Port helper active on port 5000`);
    }, 30000); // Every 30 seconds
  });
  
  // Handle errors
  server.on('error', (err) => {
    console.error(`Error in port helper: ${err.message}`);
    if (err.code === 'EADDRINUSE') {
      console.log('Port 5000 is already in use by another process');
    }
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down workflow helper...');
  process.exit(0);
});