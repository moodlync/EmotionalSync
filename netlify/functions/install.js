#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Script to ensure all dependencies are installed properly for Netlify Functions
console.log('🛠️ Installing dependencies for Netlify Functions...');

// Check if we are in the functions directory
const currentDir = process.cwd();
const inFunctionsDir = currentDir.includes('netlify/functions');

// If not in functions directory, find it
const functionsDir = inFunctionsDir 
  ? currentDir 
  : path.join(currentDir, 'netlify', 'functions');

// Check if the directory exists
if (!fs.existsSync(functionsDir)) {
  console.error(`❌ Functions directory not found: ${functionsDir}`);
  process.exit(1);
}

// Change to functions directory
if (!inFunctionsDir) {
  console.log(`📂 Changing to directory: ${functionsDir}`);
  process.chdir(functionsDir);
}

// Create .npmrc if it doesn't exist
const npmrcPath = path.join(functionsDir, '.npmrc');
if (!fs.existsSync(npmrcPath)) {
  console.log('📝 Creating .npmrc file with appropriate settings');
  fs.writeFileSync(npmrcPath, `
audit=false
fund=false
legacy-peer-deps=true
strict-peer-deps=false
package-lock=false
save-exact=true
engine-strict=false
  `.trim());
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install --no-audit --no-fund', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  
  // Attempt with additional flags
  console.log('🔄 Retrying with additional flags...');
  try {
    execSync('npm install --no-audit --no-fund --legacy-peer-deps --force', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully on retry!');
  } catch (retryError) {
    console.error('❌ Failed again:', retryError.message);
    console.log('⚠️ Continuing with deployment, but functions may not work correctly');
  }
}

console.log('🚀 Netlify Functions setup completed');