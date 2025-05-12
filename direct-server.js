// Direct Server for MoodLync on port 3000
// This server runs directly on port 3000 (Replit's preferred port)
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Log requests (except for favicon)
  if (!req.url.includes('favicon.ico')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  
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
  
  // Health check endpoint
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'MoodLync Direct Server'
    }));
    return;
  }
  
  // Handle the root path
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(PUBLIC_DIR, 'landing.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading the landing page');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }
  
  // Serve files from public directory
  const filePath = path.join(PUBLIC_DIR, req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If the file doesn't exist, serve the landing page
      fs.readFile(path.join(PUBLIC_DIR, 'landing.html'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading the landing page');
          return;
        }
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
      return;
    }
    
    // Determine content type based on file extension
    const ext = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (ext) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MoodLync Direct Server running on port ${PORT}`);
  console.log(`Server started at: ${new Date().toISOString()}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});