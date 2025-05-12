// MoodLync Direct HTTP Server for Replit
// This is a special HTTP server that's hard-coded to work on port 3000 for Replit
const http = require('http');
const fs = require('fs');

// Configuration
const PORT = 3000;
const LOG_FILE = 'replit-direct-http.log';

// Function to log both to console and file
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  logStream.write(`[${timestamp}] ${message}\n`);
}

// Start log
log('=== MoodLync Direct HTTP Server for Replit ===');
log(`Starting server on port ${PORT}`);

// Basic HTML for the page
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MoodLync - Emotion Platform</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #6366F1, #4F46E5);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
    }
    .container {
      max-width: 800px;
      background: rgba(0,0,0,0.2);
      border-radius: 16px;
      padding: 30px;
      backdrop-filter: blur(10px);
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    h2 {
      font-size: 1.8rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }
    .logo {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1.5rem;
    }
    .logo span:first-child {
      color: white;
    }
    .logo span:last-child {
      color: #FEC89A;
    }
    .card {
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 20px;
      margin: 15px 0;
      text-align: left;
    }
    .feature {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }
    .feature-icon {
      background: rgba(255,255,255,0.2);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 15px;
      font-size: 20px;
    }
    .btn {
      display: inline-block;
      background: white;
      color: #4F46E5;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 30px;
      transition: all 0.3s;
    }
    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 7px 20px rgba(0,0,0,0.2);
    }
    .status {
      margin-top: 40px;
      font-size: 0.9rem;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo"><span>MOOD</span><span>LYNC</span></div>
    
    <h1>Emotion-Driven Social Platform</h1>
    <p>Connect with others based on your emotional state in real-time</p>
    
    <div class="card">
      <div class="feature">
        <div class="feature-icon">😊</div>
        <div>
          <h3>Emotional Matching</h3>
          <p>Connect with others experiencing similar emotions</p>
        </div>
      </div>
      
      <div class="feature">
        <div class="feature-icon">🔄</div>
        <div>
          <h3>Real-Time Updates</h3>
          <p>Track your emotional journey as it evolves</p>
        </div>
      </div>
      
      <div class="feature">
        <div class="feature-icon">🏆</div>
        <div>
          <h3>Token Rewards</h3>
          <p>Earn tokens for engagement and self-awareness</p>
        </div>
      </div>
    </div>
    
    <h2>Join MoodLync Today</h2>
    <p>Experience the future of emotion-intelligent social networking</p>
    
    <a href="#" class="btn">Start Your Emotional Journey</a>
    
    <div class="status">
      <p>Server Status: Online | Version: 1.0 | Environment: Replit</p>
      <p>Current Time: ${new Date().toISOString()}</p>
      <p>(This is a special Replit preview page)</p>
    </div>
  </div>
</body>
</html>
`;

// Create HTTP server
const server = http.createServer((req, res) => {
  const url = req.url;
  
  // Log requests (except for favicon)
  if (!url.includes('favicon.ico')) {
    log(`Request: ${req.method} ${url} from ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Routes
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else if (url === '/health' || url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'MoodLync Replit HTTP'
    }));
  } else {
    // Default 404 page
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MoodLync - Page Not Found</title>
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
            max-width: 500px;
            background: rgba(0,0,0,0.2);
            border-radius: 16px;
            padding: 30px;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
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
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Page Not Found</h1>
          <p>The page you requested (${url}) does not exist on this server.</p>
          <a href="/" class="btn">Go to Homepage</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Error handling
server.on('error', (err) => {
  log(`Server error: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    log(`Port ${PORT} is already in use. Please close other servers using this port.`);
    process.exit(1);
  }
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  log(`✅ Server running on port ${PORT}`);
  log(`✅ Ready to accept connections`);
  
  fs.writeFileSync('replit-direct-http.pid', process.pid.toString());
});