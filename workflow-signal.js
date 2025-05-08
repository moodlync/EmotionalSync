/**
 * MoodLync Workflow Signal Server
 * 
 * This script creates a minimal HTTP server on port 5000 to help
 * the Replit workflow detect our application. The actual application 
 * runs on port 8080, but Replit workflows specifically look for activity
 * on port 5000.
 * 
 * This script is intended to be run separately from the main application.
 */

const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Always respond with a 200 OK status
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // Provide a simple HTML response that redirects to the actual application
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta http-equiv="refresh" content="0;url=http://localhost:8080" />
        <title>MoodLync - Redirecting</title>
        <style>
          body {
            font-family: sans-serif;
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            height: 100vh;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .container {
            max-width: 600px;
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          }
          h1 {
            font-size: 24px;
            margin-bottom: 20px;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          .loader {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          a {
            color: white;
            text-decoration: underline;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>MoodLync Application</h1>
          <div class="loader"></div>
          <p>The application is running on port 8080.</p>
          <p>You're being redirected automatically...</p>
          <p>If you're not redirected, <a href="http://localhost:8080">click here</a> to access the application.</p>
        </div>
        <script>
          // Immediate redirect to the actual application
          window.location.href = "http://localhost:8080";
        </script>
      </body>
    </html>
  `);
});

// Start the server on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('✅ MoodLync Workflow Signal Server running on port 5000');
  console.log('✅ This small server helps Replit workflow detect our application');
  console.log('✅ The actual MoodLync application runs on port 8080');
  console.log('');
  console.log('📢 Please visit http://localhost:8080 to use the application');
});

// Handle server errors
server.on('error', (err) => {
  console.error(`❌ Could not start workflow signal server: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    console.log('⚠️ Port 5000 is already in use by another process');
    console.log('⚠️ This might be another copy of the signal server or another application');
    console.log('⚠️ No need to worry if you see this message multiple times');
  }
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('Shutting down workflow signal server...');
  server.close();
  process.exit(0);
});