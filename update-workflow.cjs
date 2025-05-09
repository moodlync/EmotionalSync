/**
 * Update Workflow Configuration
 * 
 * This script creates a special file that the Replit agent can use
 * to update the workflow configuration.
 */

const fs = require('fs');
const path = require('path');

console.log('Creating workflow update request file...');

const workflowUpdateContent = `
# Workflow Update Request
# This file is read by the Replit agent to update workflow configuration

## Instructions
Please update the "Start application" workflow to use the command:
\`\`\`
node start-with-port-helper.cjs
\`\`\`

## Reason
Using this script ensures that:
1. The application runs on port 5001
2. A helper server runs on port 5000 for Replit workflow detection
3. The Replit preview will show the application correctly
`;

// Write the update request to a special file
fs.writeFileSync(
  path.join(__dirname, './replit_agent/workflow_update_request.md'),
  workflowUpdateContent,
  'utf8'
);

console.log('Workflow update request file created successfully.');
console.log('Please restart the workflow manually after the agent processes this request.');