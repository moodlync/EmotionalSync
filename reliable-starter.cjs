/**
 * Reliable starter script for MoodLync
 * This script ensures clean server startup in the Replit environment
 */

const { spawn } = require('child_process');
const http = require('http');
const { exec } = require('child_process');

// Port configuration
const REPLIT_PORT = 3000;  // Replit WebView expects this port
const APP_PORT = 5173;     // Our application runs on this port

// Log timestamp prefix
function getTimestamp() {
  return new Date().toISOString();
}

function log(message) {
  console.log(`[${getTimestamp()}] ${message}`);
}

// Find and kill processes by port
function killProcessByPort(port) {
  return new Promise((resolve, reject) => {
    // Different commands for different platforms
    const command = process.platform === 'win32' 
      ? `FOR /F "tokens=5" %P IN ('netstat -a -n -o ^| findstr :${port}') DO TaskKill /PID %P /F`
      : `lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs -r kill -9`;
    
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // Ignore errors since they may just mean no process was found
        log(`No process found on port ${port} or failed to kill: ${err.message}`);
        resolve(false);
      } else {
        log(`Successfully terminated process on port ${port}`);
        resolve(true);
      }
    });
  });
}

// Find and kill processes by name
function killProcessByName(name) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32'
      ? `taskkill /F /IM "${name}" /T`
      : `pkill -f "${name}"`;
    
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // Ignore errors since they may just mean no process was found
        log(`No process found matching "${name}" or failed to kill: ${err.message}`);
        resolve(false);
      } else {
        log(`Successfully terminated process matching "${name}"`);
        resolve(true);
      }
    });
  });
}

async function stopServers() {
  log('Stopping all server processes...');
  
  // Kill processes by port
  const ports = [3000, 5000, 5173];
  for (const port of ports) {
    await killProcessByPort(port);
  }
  
  // Kill processes by name pattern
  const processNames = [
    'node.*forwarder',
    'node.*start-combined',
    'npm run dev',
    'tsx server/index'
  ];
  
  for (const name of processNames) {
    await killProcessByName(name);
  }
  
  log('All server processes terminated.');
}

// Start the port forwarding server
function startPortForwarder() {
  // Create a proxy server
  log('Starting port forwarder...');
  const server = http.createServer((req, res) => {
    log(`Forwarding: ${req.method} ${req.url}`);
    
    // Handle CORS for browser requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    // Forward the request to the actual application
    const options = {
      hostname: 'localhost',
      port: APP_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      // Make sure we have a valid status code
      const statusCode = proxyRes.statusCode || 502;
      res.writeHead(statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      log(`Proxy error: ${err.message}`);
      res.writeHead(502, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>MoodLync - Service Unavailable</title>
            <style>
              body {
                font-family: system-ui, sans-serif;
                background: linear-gradient(135deg, #6366F1, #4F46E5);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                padding: 20px;
                text-align: center;
              }
              .container {
                max-width: 600px;
                background-color: rgba(0, 0, 0, 0.2);
                border-radius: 16px;
                padding: 30px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Service Temporarily Unavailable</h1>
              <p>We're having trouble connecting to the MoodLync application.</p>
              <p>Error: ${err.message}</p>
              <p>Please try refreshing the page in a few moments.</p>
            </div>
          </body>
        </html>
      `);
    });
    
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }
  });
  
  // Handle server errors
  server.on('error', (err) => {
    log(`Server error: ${err.message}`);
    
    if (err.code === 'EADDRINUSE') {
      log(`Port ${REPLIT_PORT} already in use. Please check for other running processes.`);
    }
  });
  
  // Start the server
  server.listen(REPLIT_PORT, '0.0.0.0', () => {
    log(`Port forwarder running at http://0.0.0.0:${REPLIT_PORT}`);
    log(`Forwarding requests from port ${REPLIT_PORT} to port ${APP_PORT}`);
  });
  
  return server;
}

// Start the actual application
function startApplication() {
  log('Starting MoodLync application...');
  const appProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { 
      ...process.env,
      NODE_ENV: 'development',
      PORT: APP_PORT.toString()
    }
  });

  appProcess.on('error', (err) => {
    log(`Failed to start application: ${err.message}`);
    process.exit(1);
  });
  
  return appProcess;
}

// Main startup function
async function main() {
  try {
    log('Starting MoodLync with reliable launcher...');
    
    // First, stop any running servers
    log('Stopping any existing servers...');
    await stopServers();
    
    // Wait a bit for all processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start the application
    const appProcess = startApplication();
    
    // Wait for app to start before creating port forwarder
    setTimeout(() => {
      const forwarder = startPortForwarder();
      
      // Handle process termination
      process.on('SIGINT', () => {
        log('Shutting down...');
        if (forwarder) forwarder.close();
        if (appProcess) appProcess.kill();
        process.exit(0);
      });
    }, 3000);
    
    log('MoodLync reliable launcher is running.');
  } catch (error) {
    log(`Error during startup: ${error.message}`);
    process.exit(1);
  }
}

// Start the application
main();