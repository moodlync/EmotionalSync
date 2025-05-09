/**
 * MoodLync Netlify Build Setup
 * 
 * This script modifies the build environment for Netlify deployments.
 * It ensures consistent theme settings and authentication handling.
 */

const fs = require('fs');
const path = require('path');

console.log('Starting MoodLync Netlify Build Setup...');

// Paths may need adjustment depending on Netlify environment
const clientSrcPath = path.join(process.cwd(), 'client', 'src');
const clientDistPath = path.join(process.cwd(), 'dist', 'public');

function fixThemeAndAuthSettings() {
  try {
    // Create necessary directories for Netlify functions
    if (!fs.existsSync(path.join(process.cwd(), 'netlify', 'functions'))) {
      fs.mkdirSync(path.join(process.cwd(), 'netlify', 'functions'), { recursive: true });
      console.log('Created Netlify functions directory');
    }

    // Handle Authentication Configuration
    // This injects necessary code to ensure our "Remember Me" functionality works in Netlify
    console.log('Setting up authentication configuration for Netlify...');

    // Prepare auth-specific settings for Netlify environment
    const netlifyAuthConfig = `
// MoodLync Netlify Authentication Configuration
// This file is auto-generated during the Netlify build process.

// Helper to handle Netlify-specific authentication paths
export function getNetlifyAuthPaths() {
  return {
    login: "/.netlify/functions/api/login",
    logout: "/.netlify/functions/api/logout",
    register: "/.netlify/functions/api/register",
    user: "/.netlify/functions/api/user",
    verifyEmail: "/.netlify/functions/api/verify-email",
    resendVerification: "/.netlify/functions/api/resend-verification"
  };
}

// Helper to determine if current environment is Netlify
export function isNetlifyEnvironment() {
  return typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
}
`;

    // Write the authentication config file
    const authConfigPath = path.join(clientSrcPath, 'lib', 'netlify-auth-config.ts');
    const authConfigDir = path.dirname(authConfigPath);
    
    if (!fs.existsSync(authConfigDir)) {
      fs.mkdirSync(authConfigDir, { recursive: true });
    }
    
    fs.writeFileSync(authConfigPath, netlifyAuthConfig);
    console.log('Created Netlify authentication configuration file');

    console.log('MoodLync Netlify Build Setup completed successfully!');
  } catch (error) {
    console.error('Error during MoodLync Netlify Build Setup:', error);
    process.exit(1);
  }
}

// Run the setup
fixThemeAndAuthSettings();