#!/usr/bin/env node
/**
 * Netlify Pre-build Setup Script
 * 
 * This script is run before the build process on Netlify to ensure that
 * the environment is properly configured for the build.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

function logSection(message) {
  console.log('\n' + '='.repeat(80));
  console.log(message);
  console.log('='.repeat(80));
}

// Start the pre-build setup process
logSection('Starting MoodLync Netlify pre-build setup');
console.log(`Node version: ${process.version}`);
console.log(`Current directory: ${process.cwd()}`);

try {
  // Set NODE_ENV to production if not defined
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
    console.log('Set NODE_ENV to production');
  }
  
  // Update browserslist DB to avoid warnings
  logSection('Updating browserslist DB');
  try {
    execSync('npx update-browserslist-db@latest', { stdio: 'inherit' });
    console.log('Browserslist database updated successfully');
  } catch (err) {
    console.warn('Failed to update browserslist database:', err.message);
    console.log('Continuing with build regardless of browserslist update status');
  }
  
  // Verify that the netlify.toml file has the correct publish directory
  logSection('Verifying netlify.toml configuration');
  let netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');
  if (fs.existsSync(netlifyTomlPath)) {
    let netlifyToml = fs.readFileSync(netlifyTomlPath, 'utf8');
    
    // Check if the publish directory is correct
    if (netlifyToml.includes('publish = "dist/public"')) {
      console.log('✓ netlify.toml publish directory is correctly set to dist/public');
    } else {
      console.warn('⚠️ netlify.toml publish directory may not be set correctly!');
      console.log('Current content:');
      console.log(netlifyToml);
    }
    
    // Check if client-side routing redirects are set up
    if (netlifyToml.includes('from = "/*"') && 
        netlifyToml.includes('to = "/index.html"') &&
        netlifyToml.includes('status = 200')) {
      console.log('✓ Client-side routing redirects are properly configured');
    } else {
      console.warn('⚠️ Client-side routing redirects may not be set up correctly!');
    }
    
    // Check API redirects
    if (netlifyToml.includes('from = "/api/*"') && 
        netlifyToml.includes('to = "/.netlify/functions/api/:splat"')) {
      console.log('✓ API redirects are properly configured');
    } else {
      console.warn('⚠️ API redirects may not be set up correctly!');
    }
  } else {
    console.error('❌ netlify.toml file not found!');
  }
  
  // Check for required environment variables
  logSection('Checking environment variables');
  const requiredEnvVars = [
    'NODE_VERSION'
  ];
  
  const optionalEnvVars = [
    'DATABASE_URL',
    'SENDGRID_API_KEY',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'VITE_STRIPE_PUBLIC_KEY'
  ];
  
  let missingRequired = false;
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.error(`❌ Required environment variable ${envVar} is not set!`);
      missingRequired = true;
    } else {
      console.log(`✓ Required environment variable ${envVar} is set`);
    }
  });
  
  if (missingRequired) {
    console.error('❌ Some required environment variables are missing. Deployment might fail!');
  } else {
    console.log('✓ All required environment variables are set');
  }
  
  optionalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.warn(`⚠️ Optional environment variable ${envVar} is not set`);
    } else {
      console.log(`✓ Optional environment variable ${envVar} is set`);
    }
  });
  
  // Setup complete
  logSection('MoodLync Netlify pre-build setup completed successfully');
  
} catch (error) {
  console.error('❌ Error in pre-build setup:', error);
  process.exit(1);
}