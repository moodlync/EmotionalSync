
#!/usr/bin/env node

/**
 * MoodLync Asset Management Script
 * 
 * This script ensures critical assets like logos are accessible for both
 * local development and Netlify deployment.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}===== MoodLync Asset Management Script =====${colors.reset}`);

// Ensure client/src/assets directory exists
const assetsDir = 'client/src/assets';
if (!fs.existsSync(assetsDir)) {
  console.log(`${colors.yellow}Creating assets directory at ${assetsDir}...${colors.reset}`);
  try {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log(`${colors.green}Successfully created assets directory${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to create assets directory: ${error.message}${colors.reset}`);
  }
}

// Copy required assets
const requiredAssets = {
  'attached_assets/logo-transparent-png.png': 'client/src/assets/logo-transparent-png.png',
  'attached_assets/logo-png.png': 'client/src/assets/logo-png.png'
};

Object.entries(requiredAssets).forEach(([source, dest]) => {
  if (fs.existsSync(source) && !fs.existsSync(dest)) {
    try {
      fs.copyFileSync(source, dest);
      console.log(`${colors.green}Copied ${source} to ${dest}${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}Failed to copy ${source}: ${error.message}${colors.reset}`);
    }
  }
});

console.log(`${colors.green}✅ Asset management completed${colors.reset}`);
