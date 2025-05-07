// This script is a special workaround to fix Replit workflow detection
// of our MoodSync application, which is already running correctly on port 5000.

import http from 'http';

// Connect to the existing application to verify it's working
const testRequest = http.get('http://localhost:5000/', (res) => {
  console.log('✅ Application is running correctly on port 5000');
  console.log(`Status: ${res.statusCode}`);
  
  // If we got a successful response, exit with success code
  if (res.statusCode >= 200 && res.statusCode < 400) {
    console.log('✅ Application is responding with success status code');
    console.log('The application is working properly and can be accessed at:');
    console.log(`https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.dev/`);
    process.exit(0);
  } else {
    console.log('❌ Application responded with an error status code');
    process.exit(1);
  }
});

testRequest.on('error', (err) => {
  console.log('❌ Unable to connect to the application:');
  console.log(err.message);
  process.exit(1);
});

// Set a reasonable timeout
testRequest.setTimeout(5000, () => {
  console.log('❌ Request timed out');
  process.exit(1);
});