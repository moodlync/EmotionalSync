/**
 * MoodLync Webview Access Test
 * 
 * This script tests access to our application through different ports
 * to diagnose Replit webview connection issues.
 */

const http = require('http');

// List of ports to test
const PORTS_TO_TEST = [
  3000, // Default Replit webview port
  5000, // Our main application port
  8080, // Common alternative port
  443   // Potential HTTPS port
];

// URLs to test on each port
const TEST_PATHS = [
  '/',
  '/api/healthcheck',
  '/api/health',
  '/api/environment'
];

// Format console output
function printHeader(text) {
  console.log('\n' + '='.repeat(50));
  console.log(' '.repeat(10) + text);
  console.log('='.repeat(50));
}

// Test a specific endpoint
async function testEndpoint(port, path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: 'GET',
      timeout: 3000
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const result = {
          status: res.statusCode,
          headers: res.headers,
          data: tryParseJSON(data)
        };
        
        console.log(`✅ ${port}${path}: ${res.statusCode} ${res.statusMessage}`);
        
        // Show more details for successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`   Content-Type: ${res.headers['content-type'] || 'not specified'}`);
          
          // Show data summary for JSON responses
          if (res.headers['content-type']?.includes('application/json')) {
            if (typeof result.data === 'object') {
              console.log(`   Response data: ${JSON.stringify(result.data).substring(0, 100)}...`);
            }
          }
        }
        
        resolve(result);
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${port}${path}: ${error.message}`);
      resolve({
        status: 0,
        error: error.message
      });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      console.log(`❌ ${port}${path}: Timeout (3s)`);
      resolve({
        status: 0,
        error: 'Request timed out'
      });
    });
    
    req.end();
  });
}

// Helper to parse JSON safely
function tryParseJSON(data) {
  try {
    return JSON.parse(data);
  } catch (e) {
    return data;
  }
}

// Run all tests
async function runTests() {
  printHeader('MoodLync Webview Access Test');
  
  // Test standard HTTP endpoints
  console.log('\n📡 Testing HTTP endpoints on multiple ports...');
  
  for (const port of PORTS_TO_TEST) {
    console.log(`\n🔍 Testing port ${port}...`);
    
    for (const path of TEST_PATHS) {
      await testEndpoint(port, path);
    }
  }
  
  console.log('\n📋 Test Summary:');
  console.log('If you see green checkmarks (✅) for port 3000, your webview bridge is working.');
  console.log('If you see green checkmarks (✅) for port 5000, your main application is available.');
  console.log('Recommended webview URL for Replit: https://{your-replit-slug}.{username}.repl.co');
}

// Run the tests
runTests().catch(console.error);