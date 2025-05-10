/**
 * MoodLync Replit Connection Tester
 * 
 * This script tests different port and connection configurations
 * to diagnose Replit webview access issues.
 */

import http from 'http';

// Text formatting for terminal output
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  bright: '\x1b[1m'
};

// Ports to test
const PORTS = [3000, 5000, 8080, 443];

// Path patterns to test on each port
const TEST_PATHS = [
  '/',
  '/api/health',
  '/api/healthcheck',
  '/api/environment'
];

/**
 * Format console output with colors
 */
function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

/**
 * Print a section header
 */
function printHeader(text) {
  console.log('\n' + '='.repeat(60));
  log(`${' '.repeat(20)}${text}`, COLORS.bright + COLORS.cyan);
  console.log('='.repeat(60));
}

/**
 * Test if a server is listening on a specific port and path
 */
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
        let responseData;
        try {
          responseData = JSON.parse(data);
        } catch (e) {
          responseData = data.substring(0, 100);
        }
        
        log(`✅ Port ${port}${path} → HTTP ${res.statusCode}`, COLORS.green);
        
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: responseData,
          success: true
        });
      });
    });
    
    req.on('error', (error) => {
      log(`❌ Port ${port}${path} → ${error.message}`, COLORS.red);
      resolve({
        status: 0,
        error: error.message,
        success: false
      });
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      log(`❌ Port ${port}${path} → Timeout (3s)`, COLORS.red);
      resolve({
        status: 0,
        error: 'Request timed out',
        success: false
      });
    });
    
    req.end();
  });
}

/**
 * Get a list of active ports
 */
async function checkPorts() {
  printHeader('CHECKING FOR ACTIVE PORTS');
  
  const results = {};
  
  for (const port of PORTS) {
    log(`\nTesting port ${port}...`, COLORS.yellow);
    
    for (const path of TEST_PATHS) {
      const result = await testEndpoint(port, path);
      if (result.success) {
        if (!results[port]) {
          results[port] = [];
        }
        results[port].push(path);
      }
    }
  }
  
  printHeader('PORT SCAN SUMMARY');
  
  for (const port of PORTS) {
    if (results[port] && results[port].length > 0) {
      log(`Port ${port}: ${COLORS.green}ACTIVE${COLORS.reset} (${results[port].length} endpoints responding)`);
      results[port].forEach(path => log(`  ${path}`, COLORS.cyan));
    } else {
      log(`Port ${port}: ${COLORS.red}INACTIVE${COLORS.reset}`);
    }
  }
  
  return results;
}

/**
 * Print overall Replit webview connection status
 */
function summarizeWebviewStatus(activePortsMap) {
  printHeader('REPLIT WEBVIEW STATUS');
  
  // Replit webview connects to port 3000 by default
  const webviewPort = 3000;
  
  if (activePortsMap[webviewPort] && activePortsMap[webviewPort].length > 0) {
    log('✅ Replit webview should be WORKING', COLORS.bright + COLORS.green);
    log(`Port ${webviewPort} is active and responding to requests`, COLORS.green);
    log('Ensure the following in your .replit file:');
    log('  1. externalPort 3000 is mapped to localPort 5000', COLORS.cyan);
    log('  2. Your workflow calls "npm run dev" or "./replit-startup.sh"', COLORS.cyan);
  } else if (activePortsMap[5000] && activePortsMap[5000].length > 0) {
    log('⚠️ PARTIAL CONNECTION', COLORS.bright + COLORS.yellow);
    log('Your main application (port 5000) is running, but port 3000 is not accessible.', COLORS.yellow);
    log('Replit requires port 3000 to be active for the webview to work.', COLORS.yellow);
    log('');
    log('Try these fixes:', COLORS.cyan);
    log('1. Run the ESM port forwarder: node start-webview-bridge.js', COLORS.cyan);
    log('2. Update .replit to map external port 3000 to local port 5000', COLORS.cyan);
    log('3. Check for any errors in the application logs', COLORS.cyan);
  } else {
    log('❌ NOT WORKING', COLORS.bright + COLORS.red);
    log('Neither port 3000 nor port 5000 is responding.', COLORS.red);
    log('');
    log('Try these fixes:', COLORS.cyan);
    log('1. Restart your application with: npm run dev', COLORS.cyan);
    log('2. Check application logs for startup errors', COLORS.cyan);
    log('3. Ensure your workflow file is correctly configured', COLORS.cyan);
  }
}

/**
 * Main function to run all tests
 */
async function runTests() {
  printHeader('MOODLYNC REPLIT CONNECTION TESTER');
  
  const activePortsMap = await checkPorts();
  summarizeWebviewStatus(activePortsMap);
  
  printHeader('NEXT STEPS');
  log('1. If webview is not working, try running ./replit-startup.sh');
  log('2. If the application has errors, check the logs');
  log('3. You can use the test-webview-access.js script for more detailed testing');
}

// Run all the tests
runTests().catch(console.error);