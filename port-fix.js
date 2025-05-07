// Simple port forwarding script to bridge port 5000 (for Replit workflow) to port 9090 (actual app)
import http from 'http';
import net from 'net';

const REPLIT_PORT = 5000;  // What Replit expects
const APP_PORT = 9090;     // Actual application port

console.log(`Starting port forwarding from port ${REPLIT_PORT} to port ${APP_PORT}...`);

// Create server that will forward requests to the actual app
const server = http.createServer((req, res) => {
  console.log(`Forwarding request: ${req.method} ${req.url}`);
  
  const options = {
    hostname: 'localhost',
    port: APP_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  // Forward the request
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });
  
  req.pipe(proxyReq, { end: true });
  
  proxyReq.on('error', (err) => {
    console.error('Proxy request error:', err);
    
    // If we can't connect to the app, return a helpful message
    res.writeHead(502, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Application Status</title>
        <style>
          body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; text-align: center; }
          h1 { color: #e63946; }
          .message { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .code { font-family: monospace; background: #f1f1f1; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Connection Error</h1>
          <div class="message">
            <p>Unable to connect to the application server on port ${APP_PORT}.</p>
            <p>Error: ${err.message}</p>
          </div>
          <p>The application may still be starting or encountered an error.</p>
        </div>
      </body>
      </html>
    `);
  });
});

// Handle WebSocket connections too
server.on('upgrade', (req, socket, head) => {
  const options = {
    hostname: 'localhost',
    port: APP_PORT,
    path: req.url,
    headers: req.headers
  };
  
  const proxyReq = http.request(options);
  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
  
  proxyReq.on('error', (err) => {
    console.error('WebSocket proxy error:', err);
    socket.end();
  });
  
  proxyReq.end();
});

// Handle errors and busy port more gracefully
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${REPLIT_PORT} is already in use.`);
    console.log('Checking if it\'s a another proxy or our application...');
    
    // Try to connect to whatever is on port 5000
    const testSocket = net.createConnection({ port: REPLIT_PORT }, () => {
      console.log(`Something is already running on port ${REPLIT_PORT}.`);
      console.log(`Your application is running on port ${APP_PORT}.`);
      console.log(`Try accessing: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.dev/`);
      testSocket.end();
      process.exit(0); // Exit with success for workflow
    });
    
    testSocket.on('error', (err) => {
      console.error(`Error checking port ${REPLIT_PORT}:`, err.message);
      process.exit(1);
    });
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
});

server.listen(REPLIT_PORT, '0.0.0.0', () => {
  console.log(`Port forwarding server listening on port ${REPLIT_PORT}`);
  console.log(`Forwarding all requests to localhost:${APP_PORT}`);
});