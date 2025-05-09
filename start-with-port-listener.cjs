/**
 * MoodLync Application Starter with Port Listener
 * 
 * This script starts both:
 * 1. A simple port listener on port 5000 for Replit workflow detection
 * 2. The main MoodLync application via npm run dev
 */

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting MoodLync Application with Port Listener');

// Create a simple HTTP server for port 5000 (for Replit workflow detection)
const server = http.createServer((req, res) => {
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

// Start the port listener server
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ Successfully started port listener on port 5000');
  console.log('✅ Replit workflow should now be able to detect the application');
});

// Generate some activity to keep the workflow connection active
setInterval(() => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Port listener active on port 5000`);
}, 60000); // Log every minute

// Start the main application
console.log('🚀 Starting main MoodLync application via npm run dev...');
const app = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

app.on('error', (error) => {
  console.error(`❌ Error starting main application: ${error.message}`);
  server.close();
  process.exit(1);
});

// Handle graceful shutdown for both servers
process.on('SIGINT', () => {
  console.log('Shutting down...');
  server.close(() => {
    console.log('Port listener shut down successfully');
    process.exit(0);
  });
});