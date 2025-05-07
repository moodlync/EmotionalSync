#!/usr/bin/env node

/**
 * Netlify Build Fix Script
 * This script helps diagnose and fix common build issues with Netlify deployments
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Running Netlify build troubleshooting...');

// Check if we're in a Netlify environment
const isNetlify = process.env.NETLIFY === 'true';
console.log(`Running in Netlify environment: ${isNetlify ? 'Yes' : 'No'}`);

// Check Node.js version
console.log(`Node.js version: ${process.version}`);
if (parseInt(process.version.slice(1)) > 20) {
  console.warn('⚠️ WARNING: Node.js version is newer than 20.x, which may cause compatibility issues');
}

// Check for critical files
const criticalFiles = [
  'package.json',
  'netlify.toml',
  'netlify/functions/api.js',
  'netlify/functions/package.json',
];

criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.error(`❌ CRITICAL: ${file} not found!`);
  }
});

// Create fallback files if needed
if (!fs.existsSync('netlify/functions/api.cjs')) {
  console.log('📝 Creating CommonJS fallback for api.js...');
  const apiCjsContent = `
// CommonJS fallback for Netlify Functions
const express = require('express');
const serverless = require('serverless-http');
const app = express();

app.get('/.netlify/functions/api', (req, res) => {
  res.json({ 
    message: 'API is running (CJS fallback)',
    timestamp: new Date().toISOString()
  });
});

exports.handler = serverless(app);
  `.trim();
  
  try {
    fs.writeFileSync('netlify/functions/api.cjs', apiCjsContent);
    console.log('✅ Created api.cjs fallback file');
  } catch (err) {
    console.error('❌ Failed to create api.cjs:', err.message);
  }
}

// Check and fix netlify/functions/.npmrc
const npmrcPath = 'netlify/functions/.npmrc';
try {
  if (!fs.existsSync(npmrcPath)) {
    console.log('📝 Creating .npmrc file for functions...');
    const npmrcContent = `
audit=false
fund=false
legacy-peer-deps=true
strict-peer-deps=false
package-lock=false
save-exact=true
engine-strict=false
use-node-version=18.18.0
    `.trim();
    fs.writeFileSync(npmrcPath, npmrcContent);
    console.log('✅ Created .npmrc file');
  } else {
    console.log('✅ .npmrc exists, ensuring proper settings...');
    let npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
    if (!npmrcContent.includes('legacy-peer-deps=true')) {
      npmrcContent += '\nlegacy-peer-deps=true';
      fs.writeFileSync(npmrcPath, npmrcContent);
      console.log('✅ Added legacy-peer-deps setting to .npmrc');
    }
  }
} catch (err) {
  console.error('❌ Failed to configure .npmrc:', err.message);
}

// Check netlify/functions/package.json dependencies
try {
  const functionsPackageJson = require('./netlify/functions/package.json');
  const requiredDeps = ['serverless-http', 'express', 'cors'];
  const missingDeps = requiredDeps.filter(dep => !functionsPackageJson.dependencies?.[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`⚠️ Functions package.json is missing dependencies: ${missingDeps.join(', ')}`);
    console.log('📝 Adding missing dependencies...');
    
    const dependencies = functionsPackageJson.dependencies || {};
    missingDeps.forEach(dep => {
      dependencies[dep] = '*';
    });
    
    functionsPackageJson.dependencies = dependencies;
    fs.writeFileSync(
      'netlify/functions/package.json', 
      JSON.stringify(functionsPackageJson, null, 2)
    );
    console.log('✅ Updated functions package.json with missing dependencies');
  } else {
    console.log('✅ Functions package.json has all required dependencies');
  }
} catch (err) {
  console.error('❌ Failed to check/update functions package.json:', err.message);
}

// Check if we need to "npm ci" serverless-http and other critical dependencies
try {
  console.log('🔍 Checking if serverless-http is installed...');
  const modulePath = path.join(process.cwd(), 'node_modules/serverless-http');
  
  if (!fs.existsSync(modulePath)) {
    console.log('📦 serverless-http not found, installing...');
    execSync('npm install --no-audit --no-fund serverless-http cors express', { 
      stdio: 'inherit',
      env: { ...process.env, NPM_CONFIG_AUDIT: 'false' }
    });
    console.log('✅ Installed serverless-http and related packages');
  } else {
    console.log('✅ serverless-http is already installed');
  }
} catch (err) {
  console.error('❌ Failed to check/install serverless-http:', err.message);
}

console.log('🏁 Troubleshooting completed');