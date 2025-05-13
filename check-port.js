/**
 * Simple port availability checker for MoodLync
 * This script checks if a specific port is already in use
 */

const net = require('net');

function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use
        resolve(true);
      } else {
        // Some other error occurred
        resolve(false);
      }
    });
    
    server.once('listening', () => {
      // Port is available
      server.close();
      resolve(false);
    });
    
    server.listen(port);
  });
}

// Check if port(s) specified as command line arguments are in use
async function main() {
  const ports = process.argv.slice(2).map(Number);
  
  if (ports.length === 0) {
    console.error('Usage: node check-port.js PORT1 [PORT2 ...]');
    process.exit(1);
  }
  
  for (const port of ports) {
    if (isNaN(port)) {
      console.error(`Invalid port number: ${port}`);
      continue;
    }
    
    const inUse = await isPortInUse(port);
    console.log(`Port ${port}: ${inUse ? 'IN USE' : 'AVAILABLE'}`);
  }
}

main().catch(console.error);