/**
 * MoodLync Port Check
 * 
 * This script checks if port 5000 is available or already in use,
 * and outputs information about the current port status.
 */

const http = require('http');
const net = require('net');

// Check if port 5000 is available
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`✅ Port ${port} is already in use`);
        console.log('This is good for Replit workflow detection');
        resolve(false);
      } else {
        console.log(`Error checking port ${port}: ${err.message}`);
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      console.log(`Port ${port} is available`);
      server.close();
      resolve(true);
    });
    
    server.listen(port, '0.0.0.0');
  });
}

// Try to send a request to port 5000
function probePort(port) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET',
      timeout: 1000
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`Response from port ${port} (Status ${res.statusCode}):`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        console.log(`Data: ${data.substring(0, 100)}...`);
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log(`Error connecting to port ${port}: ${err.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`Connection to port ${port} timed out`);
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

// Run the checks
async function main() {
  console.log('🔍 Checking port 5000 in Replit environment');
  
  // Check if port 5000 is available
  const isAvailable = await checkPort(5000);
  
  // If it's not available, try to probe it
  if (!isAvailable) {
    console.log('Attempting to probe port 5000...');
    await probePort(5000);
  }
  
  console.log('\n📋 Replit Environment Information:');
  console.log(`REPL_ID: ${process.env.REPL_ID || 'Not set'}`);
  console.log(`REPL_SLUG: ${process.env.REPL_SLUG || 'Not set'}`);
  console.log(`REPL_OWNER: ${process.env.REPL_OWNER || 'Not set'}`);
}

main().catch(console.error);