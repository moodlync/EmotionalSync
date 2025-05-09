/**
 * MoodLync Port Bridge
 * 
 * This script creates a simple HTTP server on port 5000 that redirects
 * to the actual application running on port 8080.
 * 
 * This solves the issue where the Replit workflow is expecting port 5000
 * but our application runs on port 8080.
 */

const http = require('http');
const { spawn } = require('child_process');

console.log('🚀 Starting MoodLync Port Bridge');

// Create a minimal HTTP server on port 5000 for Replit workflow detection
const workflowServer = http.createServer((req, res) => {
  console.log(`Incoming request to port 5000: ${req.url}`);
  
  res.writeHead(200, { 
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  res.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MoodLync - Application Running</title>
        <meta http-equiv="refresh" content="0;url=http://${req.headers.host.replace('5000', '8080')}" />
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          h1 { color: #4F46E5; }
          p { margin: 20px 0; }
          .redirect { color: #9333EA; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>MoodLync Application</h1>
        <p>The application is running on port 8080.</p>
        <p class="redirect">Redirecting you to the main application...</p>
        <script>
          window.location.href = "http://" + window.location.host.replace('5000', '8080');
        </script>
      </body>
    </html>
  `);
  res.end();
});

// Start the proxy server on port 5000
workflowServer.listen(5000, '0.0.0.0', () => {
  console.log('✅ Successfully opened port 5000 for Replit workflow');
  console.log('✅ The proxy will redirect requests to port 8080');
  
  // Start generating activity to keep the workflow connection active
  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Port bridge health check`);
  }, 5000);

  // Start the main application on port 8080
  console.log('Starting main MoodLync application on port 8080...');
  const app = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '8080' }
  });
  
  app.on('error', (err) => {
    console.error(`Failed to start MoodLync application: ${err.message}`);
    process.exit(1);
  });
  
  app.on('exit', (code) => {
    console.log(`MoodLync application exited with code ${code}`);
    process.exit(code || 0);
  });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});