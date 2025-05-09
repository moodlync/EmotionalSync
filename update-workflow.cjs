/**
 * MoodLync Workflow Update Helper
 * 
 * This script helps manage the port conflict between Replit workflows (which expect port 5000)
 * and our application (which runs on port 8080).
 * 
 * When executed, this script runs the combined-starter.cjs script which:
 * 1. Opens a minimal server on port 5000 for Replit workflow detection
 * 2. Starts the main application on port 8080
 * 
 * Usage: node update-workflow.cjs
 */

const fs = require('fs');
const { exec } = require('child_process');

// Start the combined starter in the background
console.log('Starting MoodLync with port management...');
const app = exec('node combined-starter.cjs');

// Pipe the output to our console
app.stdout.on('data', (data) => {
  console.log(data);
});

app.stderr.on('data', (data) => {
  console.error(data);
});

// Keep the script running to maintain the port 5000 open for Replit workflow
console.log('Keeping workflow port 5000 open...');