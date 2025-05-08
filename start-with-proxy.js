/**
 * MoodLync Startup Script with Port Proxy
 * 
 * This script:
 * 1. Starts a proxy server on port 5000 to satisfy Replit's workflow requirements
 * 2. Then starts the main application which will run on port 8080
 * 
 * This approach solves the port conflict issues in the Replit environment.
 */

// CommonJS module - using require instead of import
// @ts-nocheck

const http = require('http');
const httpProxy = require('http-proxy');
const { exec } = require('child_process');

console.log('Starting MoodLync with port proxy...');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Handle proxy errors
proxy.on('error', function(err, req, res) {
  console.error('Proxy error:', err);
  
  if (res && res.writeHead && !res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.message);
  }
});

// Create a server that uses the proxy
const server = http.createServer(function(req, res) {
  // Target our application running on port 8080
  proxy.web(req, res, { target: 'http://localhost:8080' });
});

// Listen on port 5000
server.listen(5000, () => {
  console.log('Replit port proxy listening on port 5000, forwarding to port 8080');
  
  // Now start the actual application 
  console.log('Starting main application...');
  const app = exec('NODE_ENV=development tsx server/index.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return;
    }
    console.log(`Output: ${stdout}`);
  });
  
  // Pipe the application output to the console
  app.stdout.pipe(process.stdout);
  app.stderr.pipe(process.stderr);
});