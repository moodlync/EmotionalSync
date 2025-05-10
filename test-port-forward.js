/**
 * MoodLync Port Forwarding Test
 * This script will test if the port forwarding is working properly
 */

import http from 'http';

// Test URLs
const urls = [
  { path: '/test', description: 'Test endpoint' },
  { path: '/api/health', description: 'Health endpoint' },
  { path: '/', description: 'Root endpoint' }
];

// Configuration
const PORT = 3000;
const HOST = 'localhost';

console.log(`\n🔍 Testing MoodLync Port Forwarding`);
console.log(`📊 Testing against localhost:${PORT}\n`);

// Function to make a request and print the result
function testEndpoint(url) {
  return new Promise((resolve) => {
    console.log(`Testing ${url.path} (${url.description})...`);
    
    const options = {
      hostname: HOST,
      port: PORT,
      path: url.path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const statusText = status >= 200 && status < 300 ? '✅ Success' : '❌ Failed';
        console.log(`  ${statusText} - Status: ${status}`);
        
        // For JSON responses, try to parse
        if (res.headers['content-type']?.includes('application/json')) {
          try {
            const json = JSON.parse(data);
            console.log(`  Response: ${JSON.stringify(json).substring(0, 100)}${JSON.stringify(json).length > 100 ? '...' : ''}`);
          } catch (e) {
            console.log(`  Response: [Invalid JSON]`);
          }
        } else if (data.length < 200) {
          // For short responses, show the content
          console.log(`  Response: ${data.substring(0, 100).replace(/\n/g, '').trim()}${data.length > 100 ? '...' : ''}`);
        } else {
          // For HTML or other responses, just show the length
          console.log(`  Response: [${data.length} bytes]`);
        }
        
        console.log('');
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error(`  ❌ Error: ${error.message}`);
      console.log('');
      resolve();
    });
    
    req.end();
  });
}

// Run tests in sequence
async function runTests() {
  for (const url of urls) {
    await testEndpoint(url);
  }
  
  console.log('✨ All tests completed');
}

runTests().catch(console.error);