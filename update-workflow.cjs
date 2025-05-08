/**
 * Update Replit Workflow
 * 
 * This script updates the Replit workflow to use our combined starter script
 * instead of directly running npm run dev.
 */

const fs = require('fs');
const path = require('path');

// Path to .replit file
const replitFilePath = './.replit';

try {
  // Check if .replit file exists
  if (!fs.existsSync(replitFilePath)) {
    console.error('.replit file not found. Cannot update workflow.');
    process.exit(1);
  }

  // Read the .replit file
  let replitContent = fs.readFileSync(replitFilePath, 'utf8');
  
  // Replace the run command in the .replit file
  // (Note: this is a simple text replacement and might need to be adjusted)
  replitContent = replitContent.replace(
    /run = "npm run dev"/g,
    'run = "node start-app.cjs"'
  );
  
  // Write the updated content back to the .replit file
  fs.writeFileSync(replitFilePath, replitContent, 'utf8');
  
  console.log('✅ Successfully updated .replit workflow configuration');
  console.log('✅ The workflow will now use the combined starter script');
  
} catch (error) {
  console.error('Error updating workflow configuration:', error.message);
}