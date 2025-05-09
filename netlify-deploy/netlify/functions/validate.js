// Netlify deployment validation script (ESM version)

// This script validates that all required files are present for the Netlify deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Files that are required for the Netlify deployment
const requiredFiles = [
  'routes.js',
  'api.js'
];

// Get directory path in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if all required files exist
const missingFiles = requiredFiles.filter(file => !fileExists(path.join(__dirname, file)));

// Log the results
if (missingFiles.length === 0) {
  console.log('✅ All required files for Netlify deployment are present');
} else {
  console.error('❌ The following files are missing for Netlify deployment:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
}

// Export a simple function handler that can be used to test the Netlify deployment
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'MoodLync Netlify deployment validation successful',
      timestamp: new Date().toISOString()
    })
  };
};