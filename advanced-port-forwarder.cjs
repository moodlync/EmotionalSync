/**
 * Advanced Port Forwarder for MoodLync
 * 
 * This script creates a more robust port forwarder that:
 * 1. Opens port 5000 for the Replit workflow detection
 * 2. Forwards all HTTP and WebSocket traffic to port 8080 where the main app runs
 */

const http = require('http');
const net = require('net');
const { spawn } = require('child_process');

console.log('🔄 Starting MoodLync Advanced Port Forwarder');

// Configuration
const WORKFLOW_PORT = 5000;
const APP_PORT = 8080;

// Create HTTP server for port 5000
const server = http.createServer((req, res) => {
  // Create options for the proxied request
  const options = {
    hostname: '127.0.0.1',
    port: APP_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  // Special case for direct access to port 5000 root URL
  if (req.url === '/' || req.url === '') {
    res.writeHead(302, {
      'Location': `http://${req.headers.host.replace(WORKFLOW_PORT.toString(), APP_PORT.toString())}${req.url}`
    });
    res.end();
    return;
  }

  // Create proxy request
  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  // Handle errors
  proxy.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error connecting to main application: ${err.message}`);
  });

  // Pipe the original request data to the proxy request
  req.pipe(proxy);
});

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
  const options = {
    hostname: '127.0.0.1',
    port: APP_PORT,
    path: req.url,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${APP_PORT}`
    }
  };

  // Create proxy connection
  const proxy = net.connect(APP_PORT, '127.0.0.1', () => {
    proxy.write(`${req.method} ${req.url} HTTP/1.1\r\n`);
    
    // Copy headers
    Object.keys(req.headers).forEach(key => {
      proxy.write(`${key}: ${req.headers[key]}\r\n`);
    });
    
    proxy.write('\r\n');
    if (head && head.length) proxy.write(head);
    
    // Pipe socket data bidirectionally
    socket.pipe(proxy).pipe(socket);
  });

  proxy.on('error', (err) => {
    console.error(`WebSocket proxy error: ${err.message}`);
    socket.end();
  });
});

// Listen on the workflow port
server.listen(WORKFLOW_PORT, '0.0.0.0', () => {
  console.log(`✅ Port forwarding active: ${WORKFLOW_PORT} → ${APP_PORT}`);
  console.log(`✅ Replit workflow should now detect the application`);

  // Check if the main app is running
  const checkAppInterval = setInterval(() => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: APP_PORT,
      path: '/',
      method: 'HEAD'
    }, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 500) {
        console.log(`✅ Main application is running on port ${APP_PORT}`);
      } else {
        console.log(`⚠️ Main application returned status ${res.statusCode}`);
      }
    });
    
    req.on('error', () => {
      console.log(`⚠️ Main application not detected on port ${APP_PORT}`);
      
      // Try to start the main app if it's not running
      console.log('🔄 Attempting to start main application...');
      
      try {
        // Cleanly start the main application in the background
        const app = spawn('npm', ['run', 'dev:original'], {
          shell: true,
          detached: true,
          stdio: 'ignore',
          env: { ...process.env, PORT: APP_PORT.toString() }
        });
        
        // Unref the child so it's not tied to this process
        app.unref();
        
        console.log('🚀 Main application startup triggered');
      } catch (err) {
        console.error(`⚠️ Failed to start main application: ${err.message}`);
      }
    });
    
    req.end();
  }, 10000); // Check every 10 seconds

  // Generate heartbeat for the workflow
  setInterval(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Port forwarder active (${WORKFLOW_PORT} → ${APP_PORT})`);
  }, 10000);
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    clearInterval(checkAppInterval);
    console.log('Shutting down port forwarder...');
    server.close(() => {
      console.log('Port forwarder shut down successfully');
      process.exit(0);
    });
  });
});

// Handle any errors
server.on('error', (err) => {
  console.error(`⚠️ Server error: ${err.message}`);
  
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${WORKFLOW_PORT} is already in use. This might be another forwarder instance.`);
  } else {
    process.exit(1);
  }
});