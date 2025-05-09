/**
 * Netlify Build Setup
 * 
 * This script runs during Netlify builds to set up the environment properly
 * and ensure all paths and settings are correctly configured for the Netlify deployment.
 */

console.log('Running MoodLync Netlify build setup script...');

// Set up the NODE_ENV
if (!process.env.NODE_ENV) {
  console.log('Setting NODE_ENV to production');
  process.env.NODE_ENV = 'production';
}

// Ensure theme settings are preserved
try {
  const fs = require('fs');
  const path = require('path');
  
  // Make sure theme settings are properly set
  const themeContent = `
// MoodLync Theme Settings for Netlify
// This file is generated during build and should not be edited manually

// Force light mode for auth and welcome pages
export const AUTH_PAGES_FORCE_LIGHT_MODE = true;

// Set remember-me behavior
export const PERSIST_USER_STATE = 'conditional';
`;

  // Ensure the directory exists
  const themeDirPath = path.join(process.cwd(), 'client', 'src', 'lib');
  if (!fs.existsSync(themeDirPath)) {
    console.log(`Creating directory: ${themeDirPath}`);
    fs.mkdirSync(themeDirPath, { recursive: true });
  }

  // Write the theme settings file
  const themeFilePath = path.join(themeDirPath, 'theme-settings.ts');
  console.log(`Writing theme settings to: ${themeFilePath}`);
  fs.writeFileSync(themeFilePath, themeContent);

  console.log('Theme settings configured successfully');
} catch (error) {
  console.error('Error setting up theme settings:', error);
}

// Additional Netlify-specific setup can be added here

console.log('MoodLync Netlify build setup completed');