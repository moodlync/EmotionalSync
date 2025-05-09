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

// Define important logo files and their potential sources
const logoFiles = [
  {
    dest: 'client/src/assets/new-logo.png',
    sources: [
      'attached_assets/logo-transparent-png.png',
      'attached_assets/logo-png.png',
      'public/logo-transparent-png.png',
      'public/logo-png.png',
      'client/public/logo-transparent-png.png',
      'client/public/logo-png.png'
    ]
  },
  {
    dest: 'client/src/assets/moodlync-logo-enhanced.png',
    sources: [
      'attached_assets/logo-transparent-png.png',
      'attached_assets/logo-png.png',
      'public/logo-transparent-png.png',
      'public/logo-png.png',
      'client/public/logo-transparent-png.png',
      'client/public/logo-png.png'
    ]
  }
];

// Copy logo files if needed
logoFiles.forEach(logoFile => {
  if (!fs.existsSync(logoFile.dest)) {
    console.log(`${colors.yellow}Logo file not found at ${logoFile.dest}, searching for alternatives...${colors.reset}`);
    
    let logoFound = false;
    for (const sourcePath of logoFile.sources) {
      if (fs.existsSync(sourcePath)) {
        console.log(`${colors.green}Found logo at ${sourcePath}, copying to ${logoFile.dest}...${colors.reset}`);
        try {
          fs.copyFileSync(sourcePath, logoFile.dest);
          console.log(`${colors.green}Successfully copied logo file to ${logoFile.dest}${colors.reset}`);
          logoFound = true;
          break;
        } catch (error) {
          console.error(`${colors.red}Failed to copy logo file: ${error.message}${colors.reset}`);
        }
      }
    }
    
    if (!logoFound) {
      console.log(`${colors.yellow}Warning: Could not find any source file for ${logoFile.dest}${colors.reset}`);
    }
  } else {
    console.log(`${colors.green}Logo file already exists at ${logoFile.dest}${colors.reset}`);
  }
});

// Check for other important assets from attached_assets folder
const attachedAssetsDir = 'attached_assets';
if (fs.existsSync(attachedAssetsDir)) {
  try {
    console.log(`\n${colors.blue}Checking attached assets directory...${colors.reset}`);
    const files = fs.readdirSync(attachedAssetsDir);
    
    // Look for important image files to copy to assets
    const imageFiles = files.filter(file => 
      file.endsWith('.png') || 
      file.endsWith('.jpg') || 
      file.endsWith('.jpeg') || 
      file.endsWith('.svg')
    );
    
    if (imageFiles.length > 0) {
      console.log(`${colors.blue}Found ${imageFiles.length} image files in attached assets${colors.reset}`);
      
      imageFiles.forEach(file => {
        const source = path.join(attachedAssetsDir, file);
        const dest = path.join(assetsDir, file);
        
        if (!fs.existsSync(dest)) {
          try {
            fs.copyFileSync(source, dest);
            console.log(`${colors.green}Copied ${file} to assets directory${colors.reset}`);
          } catch (error) {
            console.error(`${colors.red}Failed to copy ${file}: ${error.message}${colors.reset}`);
          }
        } else {
          console.log(`${colors.yellow}File ${file} already exists in assets directory${colors.reset}`);
        }
      });
    } else {
      console.log(`${colors.yellow}No image files found in attached assets directory${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error processing attached assets: ${error.message}${colors.reset}`);
  }
}

console.log(`\n${colors.green}✅ Asset management completed${colors.reset}`);
console.log(`${colors.cyan}===== End of MoodLync Asset Management Script =====${colors.reset}`);