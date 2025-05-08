/**
 * MoodLync Application Starter
 * 
 * This script is a workaround for Replit workflow port issues.
 * It starts the application with our port proxy to satisfy Replit workflow requirements.
 * 
 * Usage: node start-app.js
 */

// CommonJS module - using require instead of import
// @ts-nocheck

const { exec } = require('child_process');

console.log('Starting MoodLync with port proxy...');
const app = exec('node start-with-proxy.js', (error, stdout, stderr) => {
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

// Pipe the output to our console
app.stdout.pipe(process.stdout);
app.stderr.pipe(process.stderr);