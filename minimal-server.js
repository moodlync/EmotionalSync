// Minimal standalone server for Replit webview
const http = require('http');
const fs = require('fs');

// Read the landing page HTML
let landingPage;
try {
  landingPage = fs.readFileSync('./public/landing.html', 'utf8');
} catch (err) {
  landingPage = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>MoodLync</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          display: flex; 
          justify-content: center; 
          align-items: center; 
          height: 100vh; 
          margin: 0;
          background: linear-gradient(135deg, #6366F1, #4F46E5);
          color: white;
          text-align: center;
        }
        .container {
          max-width: 600px;
          padding: 40px;
          background: rgba(0,0,0,0.2);
          border-radius: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to MoodLync</h1>
        <p>Connecting through emotions</p>
      </div>
    </body>
    </html>
  `;
}

// Create the server
const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.writeHead(200);
  res.end(landingPage);
});

// Start on port 3000
server.listen(3000, '0.0.0.0', () => {
  console.log('Minimal server running on port 3000');
});