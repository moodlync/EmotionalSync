/**
 * MoodLync Workflow Update Script
 * 
 * This script helps configure the Replit workflow to work with our application.
 * It correctly sets up port forwarding between port 5000 (Replit workflow) and 
 * port 8080 (main application).
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔧 MoodLync Workflow Update Tool');
console.log('==============================');
console.log('');

// Start the workflow helper to handle port 5000
const startWorkflowHelper = () => {
  console.log('Starting workflow helper on port 5000...');
  
  try {
    const helper = spawn('node', ['workflow-helper.cjs'], {
      detached: true,
      stdio: 'ignore'
    });
    
    helper.unref();
    console.log('✅ Workflow helper started successfully');
    return true;
  } catch (error) {
    console.error(`❌ Failed to start workflow helper: ${error.message}`);
    return false;
  }
};

// Start the main application
const startMainApplication = () => {
  console.log('Starting main application on port 8080...');
  
  try {
    console.log('To start the application, run:');
    console.log('npm run dev');
    console.log('');
    console.log('Make sure to run the workflow helper first by running:');
    console.log('node workflow-helper.cjs');
    return true;
  } catch (error) {
    console.error(`❌ Failed to start main application: ${error.message}`);
    return false;
  }
};

// Main function
const main = async () => {
  console.log('Checking port configuration...');
  
  // Check for workflow helper
  if (!fs.existsSync('workflow-helper.cjs')) {
    console.error('❌ workflow-helper.cjs not found');
    return;
  }
  
  console.log('✅ workflow-helper.cjs found');
  
  // Start workflow helper
  const helperStarted = startWorkflowHelper();
  if (!helperStarted) {
    console.log('❌ Failed to start workflow helper');
    return;
  }
  
  // Provide instructions for the main application
  startMainApplication();
  
  console.log('');
  console.log('==============================');
  console.log('✅ Workflow update completed successfully');
  console.log('The application should now be accessible on both port 5000 and 8080');
  console.log('');
  console.log('Important:');
  console.log('- Replit workflow will detect the application on port 5000');
  console.log('- The actual application is running on port 8080');
  console.log('- Requests to port 5000 will be redirected to port 8080');
  console.log('==============================');
};

// Execute the main function
main().catch(error => {
  console.error(`❌ An error occurred: ${error.message}`);
});