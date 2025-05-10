// ESM module to check if port forwarding is working correctly
import http from 'http';

// Configuration
const PORTS_TO_CHECK = [3000, 5000];
const HOST = 'localhost';

console.log('Checking port forwarding configuration for MoodLync application...');

for (const port of PORTS_TO_CHECK) {
  console.log(`\nTesting port ${port}...`);
  
  // Test both root and health endpoints
  const paths = ['/', '/health', '/api/health'];
  
  for (const path of paths) {
    testEndpoint(HOST, port, path);
  }
}

function testEndpoint(host, port, path) {
  const options = {
    hostname: host,
    port: port,
    path: path,
    method: 'GET',
    timeout: 5000 // 5 second timeout
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    // A chunk of data has been received
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    // The whole response has been received
    res.on('end', () => {
      console.log(`✅ Port ${port}, Path ${path}: Status ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log(`   Response: ${JSON.stringify(json).substring(0, 100)}${JSON.stringify(json).length > 100 ? '...' : ''}`);
      } catch (e) {
        console.log(`   Response length: ${data.length} bytes`);
        console.log(`   Response preview: ${data.substring(0, 50)}${data.length > 50 ? '...' : ''}`);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error(`❌ Port ${port}, Path ${path}: ERROR - ${error.message}`);
  });
  
  req.on('timeout', () => {
    console.error(`❌ Port ${port}, Path ${path}: TIMEOUT - Request took too long`);
    req.destroy();
  });
  
  req.end();
}

// Give time for all async requests to complete
setTimeout(() => {
  console.log('\nPort checking completed. If any errors were found, please check your server configuration.');
}, 6000);