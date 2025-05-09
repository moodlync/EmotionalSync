#!/usr/bin/env node

/**
 * Port Check Utility
 * 
 * This script checks if the ports 5000 and 8080 are reachable and
 * verifies the application is running correctly.
 */

const http = require('http');

function checkPort(port) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          port,
          status: res.statusCode,
          working: true,
          message: `Port ${port} is working - Status: ${res.statusCode}`
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        port,
        working: false,
        message: `Port ${port} error: ${err.message}`
      });
    });
    
    req.setTimeout(3000, () => {
      req.abort();
      resolve({
        port,
        working: false,
        message: `Port ${port} timeout - service may not be running`
      });
    });
  });
}

async function main() {
  console.log('=== MoodLync Port Check Utility ===');
  
  try {
    const port5000Result = await checkPort(5000);
    console.log(port5000Result.message);
    
    const port8080Result = await checkPort(8080);
    console.log(port8080Result.message);
    
    if (port5000Result.working && port8080Result.working) {
      console.log('\n✅ All ports are working correctly!');
      console.log('The application should be visible in the Replit preview.');
    } else {
      console.log('\n⚠️ Some ports are not working correctly.');
      
      if (!port5000Result.working) {
        console.log('Replit workflow detection (port 5000) is not working.');
        console.log('Try running: node ./simple-port-helper.cjs');
      }
      
      if (!port8080Result.working) {
        console.log('Main application (port 8080) is not working.');
        console.log('Try restarting the workflow.');
      }
    }
  } catch (error) {
    console.error('Error during port check:', error);
  }
}

main();