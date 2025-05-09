#!/usr/bin/env node

/**
 * Netlify Build Fix Script
 * 
 * This script helps diagnose and fix common build issues with Netlify deployments.
 * It specifically addresses issues with:
 * 1. Node.js version compatibility
 * 2. Missing dependencies for the build process
 * 3. Vite command not found errors
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}===== MoodSync Netlify Build Fix Script =====${colors.reset}`);
console.log(`${colors.cyan}Running pre-build diagnostics and fixes...${colors.reset}`);

// Check Node.js version
const requiredNodeVersion = '18.18.0';
const currentNodeVersion = process.version.slice(1); // Remove the 'v' prefix

console.log(`\n${colors.blue}Checking Node.js version...${colors.reset}`);
console.log(`Current Node.js version: ${currentNodeVersion}`);
console.log(`Required Node.js version: ${requiredNodeVersion}`);

// Compare versions (simple string comparison, not semantic versioning)
if (currentNodeVersion !== requiredNodeVersion) {
  console.log(`${colors.yellow}Warning: Running with a different Node.js version than specified.${colors.reset}`);
  console.log(`This might cause compatibility issues. Consider updating .nvmrc or NODE_VERSION in netlify.toml.`);
}

// Check for the presence of package.json
console.log(`\n${colors.blue}Checking package.json...${colors.reset}`);
if (!fs.existsSync('package.json')) {
  console.error(`${colors.red}Error: package.json not found!${colors.reset}`);
  process.exit(1);
}

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Check for Vite in dependencies
console.log(`\n${colors.blue}Checking for Vite dependency...${colors.reset}`);

const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
const hasVite = !!dependencies.vite;

if (hasVite) {
  console.log(`${colors.green}Found vite in package.json${colors.reset}`);
} else {
  console.log(`${colors.yellow}Vite not found in package.json, installing it...${colors.reset}`);
  try {
    execSync('npm install --no-audit --no-fund vite', { stdio: 'inherit' });
    console.log(`${colors.green}Successfully installed vite${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to install vite: ${error.message}${colors.reset}`);
  }
}

// Create a new local .npmrc file if it doesn't exist
if (!fs.existsSync('.npmrc')) {
  console.log(`\n${colors.blue}Creating .npmrc file with Node version specification...${colors.reset}`);
  fs.writeFileSync('.npmrc', `use-node-version=${requiredNodeVersion}\n`);
  console.log(`${colors.green}Successfully created .npmrc file${colors.reset}`);
}

// Check for build script in package.json
console.log(`\n${colors.blue}Checking for build script in package.json...${colors.reset}`);
if (!packageJson.scripts || !packageJson.scripts.build) {
  console.error(`${colors.red}Error: No build script found in package.json!${colors.reset}`);
  // Add a generic build script if missing
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  packageJson.scripts.build = 'vite build';
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log(`${colors.green}Added a generic build script to package.json${colors.reset}`);
}

// Check for build dependencies
console.log(`\n${colors.blue}Checking for essential build dependencies...${colors.reset}`);
const essentialDeps = [
  'vite',
  '@vitejs/plugin-react',
  'typescript',
  'esbuild'
];

const missingDeps = essentialDeps.filter(dep => !dependencies[dep]);

if (missingDeps.length > 0) {
  console.log(`${colors.yellow}Missing essential build dependencies: ${missingDeps.join(', ')}`);
  console.log(`Installing missing dependencies...${colors.reset}`);
  
  try {
    execSync(`npm install --no-audit --no-fund ${missingDeps.join(' ')}`, { stdio: 'inherit' });
    console.log(`${colors.green}Successfully installed missing dependencies${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to install dependencies: ${error.message}${colors.reset}`);
  }
}

// Check for Vite in node_modules
console.log(`\n${colors.blue}Checking for Vite in node_modules...${colors.reset}`);
const viteBinPath = path.join('node_modules', '.bin', 'vite');

if (fs.existsSync(viteBinPath)) {
  console.log(`${colors.green}Found vite binary at ${viteBinPath}${colors.reset}`);
  // Make vite executable
  try {
    fs.chmodSync(viteBinPath, '755');
    console.log(`${colors.green}Made vite binary executable${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Failed to make vite binary executable: ${error.message}${colors.reset}`);
  }
} else {
  console.log(`${colors.yellow}Vite binary not found at ${viteBinPath}, attempting to install...${colors.reset}`);
  try {
    execSync('npm install --no-audit --no-fund vite', { stdio: 'inherit' });
    console.log(`${colors.green}Successfully installed vite${colors.reset}`);
    
    // Check again after installation
    if (fs.existsSync(viteBinPath)) {
      fs.chmodSync(viteBinPath, '755');
      console.log(`${colors.green}Made vite binary executable${colors.reset}`);
    } else {
      console.error(`${colors.red}Vite binary still not found after installation!${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Failed to install vite: ${error.message}${colors.reset}`);
  }
}

// Verify npm paths
console.log(`\n${colors.blue}Checking npm paths...${colors.reset}`);
try {
  const npmPathOutput = execSync('npm config get prefix').toString().trim();
  console.log(`npm prefix: ${npmPathOutput}`);
  
  // Show PATH environment variable
  console.log(`PATH: ${process.env.PATH}`);
  
  // Add node_modules/.bin to PATH if not already there
  const binPath = path.resolve('node_modules/.bin');
  if (!process.env.PATH.includes(binPath)) {
    console.log(`${colors.yellow}Adding ${binPath} to PATH${colors.reset}`);
    process.env.PATH = `${binPath}:${process.env.PATH}`;
    console.log(`Updated PATH: ${process.env.PATH}`);
  }
} catch (error) {
  console.error(`${colors.red}Failed to check npm paths: ${error.message}${colors.reset}`);
}

// Add build.sh script as a fallback
console.log(`\n${colors.blue}Creating fallback build.sh script...${colors.reset}`);
const buildShContent = `#!/bin/bash
export PATH="./node_modules/.bin:$PATH"
export NODE_ENV=production
echo "Running build with Vite directly..."
./node_modules/.bin/vite build
`;

fs.writeFileSync('build.sh', buildShContent);
fs.chmodSync('build.sh', '755');
console.log(`${colors.green}Successfully created fallback build.sh script${colors.reset}`);

// Update package.json build script to ensure it can find vite
const updatedBuildScript = './node_modules/.bin/vite build';
if (packageJson.scripts.build !== updatedBuildScript) {
  console.log(`\n${colors.blue}Updating build script in package.json...${colors.reset}`);
  packageJson.scripts.build = updatedBuildScript;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log(`${colors.green}Updated build script in package.json to use explicit path${colors.reset}`);
}

// Update browserslist database to fix the warning
console.log(`\n${colors.blue}Updating browserslist database...${colors.reset}`);
try {
  execSync('npx update-browserslist-db@latest', { stdio: 'inherit' });
  console.log(`${colors.green}Successfully updated browserslist database${colors.reset}`);
} catch (error) {
  console.log(`${colors.yellow}Warning: Failed to update browserslist database: ${error.message}${colors.reset}`);
  console.log(`${colors.yellow}This may cause warnings but should not fail the build${colors.reset}`);
}

console.log(`\n${colors.green}✅ Build fix script completed successfully${colors.reset}`);
console.log(`${colors.cyan}===== End of MoodSync Netlify Build Fix Script =====${colors.reset}`);