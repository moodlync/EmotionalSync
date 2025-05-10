/**
 * MoodLync Combined Starter for Replit
 * 
 * This script starts both:
 * 1. The port forwarder optimized for Replit webview (on port 3000)
 * 2. The main application server (on port 5000)
 * 
 * The key improvement is that we ensure the application is accessible 
 * through the Replit webview which connects to our port 3000
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Environment setup
process.env.REPLIT_ENVIRONMENT = 'true';
process.env.IS_REPLIT = 'true';

// Configuration
const APP_PORT = 5000;
const WEBVIEW_PORT = 3000;
const LOG_FILE = 'combined-startup.log';

// Utility to add timestamps to logs
function timestamp() {
  return new Date().toISOString();
}

// Create log file
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
function log(message) {
  const logMessage = `[${timestamp()}] ${message}`;
  console.log(logMessage);
  logStream.write(logMessage + '\n');
}

// Display startup header
log('======================================');
log('        MOODLYNC REPLIT STARTER       ');
log('======================================');
log(`Starting with APP_PORT=${APP_PORT}, WEBVIEW_PORT=${WEBVIEW_PORT}`);
log(`Replit environment detected`);

// Create http-proxy forwarding server
const http = require('http');
const httpProxy = require('http-proxy');

// Clean up any previous forwarding processes
function killPreviousProcesses() {
  try {
    if (fs.existsSync('webview-bridge.pid')) {
      const pid = fs.readFileSync('webview-bridge.pid', 'utf8').trim();
      log(`Stopping previous webview bridge (PID: ${pid})...`);
      try {
        process.kill(parseInt(pid, 10));
      } catch (e) {
        log(`Error stopping previous webview bridge: ${e.message}`);
      }
      fs.unlinkSync('webview-bridge.pid');
    }
  } catch (error) {
    log(`Error in cleanup: ${error.message}`);
  }
}

// Create the proxy server
function startProxyServer() {
  log('Starting port forwarding server...');
  
  const proxy = httpProxy.createProxyServer({
    target: `http://localhost:${APP_PORT}`,
    ws: true,
    xfwd: true,
    changeOrigin: true
  });
  
  proxy.on('error', (err, req, res) => {
    log(`Proxy error: ${err.message}`);
    if (res.writeHead && !res.headersSent) {
      res.writeHead(502, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify({
        error: 'proxy_error',
        message: 'Cannot connect to the MoodLync application server',
        details: err.message
      }));
    }
  });
  
  const server = http.createServer((req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, Accept');
    res.setHeader('X-MoodLync-Proxy', 'replit-webview-proxy');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    
    // Forward the request
    proxy.web(req, res);
  });
  
  // Handle WebSocket connections
  server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
  });
  
  // Start the proxy server
  server.listen(WEBVIEW_PORT, '0.0.0.0', () => {
    log(`✅ Port forwarder running on ${WEBVIEW_PORT}, forwarding to ${APP_PORT}`);
    log(`✅ This allows the Replit webview to connect to our application`);
    fs.writeFileSync('webview-bridge.pid', process.pid.toString());
  });
  
  return server;
}

// Start the main application
function startMainApplication() {
  log('Starting main MoodLync application...');
  
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  const appProcess = spawn('npm', ['run', 'dev'], {
    env: {
      ...process.env,
      NODE_ENV: nodeEnv,
      PORT: APP_PORT.toString(),
      REPLIT_ENVIRONMENT: 'true',
      IS_REPLIT: 'true'
    },
    stdio: 'pipe'
  });
  
  appProcess.stdout.on('data', (data) => {
    process.stdout.write(data);
    logStream.write(data);
  });
  
  appProcess.stderr.on('data', (data) => {
    process.stderr.write(data);
    logStream.write(`[ERROR] ${data}`);
  });
  
  appProcess.on('close', (code) => {
    log(`Application process exited with code ${code}`);
    process.exit(code);
  });
  
  return appProcess;
}

// Main execution
function main() {
  try {
    // Clean up previous processes
    killPreviousProcesses();
    
    // Start the proxy server
    const proxyServer = startProxyServer();
    
    // Start the main application
    const appProcess = startMainApplication();
    
    // Handle process termination
    process.on('SIGINT', () => {
      log('Shutting down...');
      appProcess.kill();
      proxyServer.close();
      logStream.end();
      process.exit(0);
    });
    
    log('MoodLync startup complete - systems operational');
  } catch (error) {
    log(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Start everything
main();