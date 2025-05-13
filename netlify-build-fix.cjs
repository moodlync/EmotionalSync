/**
 * Netlify build fix script
 * This script runs before the build process to fix known issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// We don't modify package.json directly, instead we work with the deploy-package.json
console.log('Checking for deploy-package.json...');
if (fs.existsSync('./deploy-package.json')) {
  console.log('Found deploy-package.json for Netlify build');
}

// Fix Tailwind CSS issue with border-border
console.log('Fixing Tailwind CSS issues...');
const cssPath = './client/src/index.css';
if (fs.existsSync(cssPath)) {
  // Create a backup of the original CSS file
  fs.copyFileSync(cssPath, `${cssPath}.bak`);
  
  // Fix the CSS content
  let cssContent = fs.readFileSync(cssPath, 'utf-8');
  cssContent = cssContent.replace(
    '@apply border-border;', 
    '@apply border-[color:hsl(var(--border))];'
  );
  fs.writeFileSync(cssPath, cssContent);
  console.log('Tailwind CSS fixes applied');
}

// Create _redirects file for SPA routing
const redirectsPath = './_redirects';
console.log('Creating _redirects file...');
fs.writeFileSync(redirectsPath, '/* /index.html 200');
console.log('_redirects file created');

// Make sure dist and dist/client directories exist
console.log('Ensuring dist/client directory exists...');
const distDirPath = path.join(__dirname, 'dist');
const clientDirPath = path.join(__dirname, 'dist', 'client');

if (!fs.existsSync(distDirPath)) {
  fs.mkdirSync(distDirPath, { recursive: true });
}

if (!fs.existsSync(clientDirPath)) {
  fs.mkdirSync(clientDirPath, { recursive: true });
  console.log('dist/client directory created');
}

// Install additional dependencies needed for build
console.log('Installing any missing build dependencies...');
try {
  execSync('npm install --no-save @vitejs/plugin-react vite autoprefixer postcss tailwindcss', { stdio: 'inherit' });
  console.log('Build dependencies installed');
} catch (error) {
  console.error('Error installing build dependencies:', error.message);
}

console.log('Netlify build fix completed successfully!');

// Create a post-build script to move files to the right location
const postBuildScriptPath = './netlify-post-build.cjs';
console.log('Creating post-build script...');
const postBuildScript = `
const fs = require('fs');
const path = require('path');

console.log('Running post-build tasks...');

// Copy build files to client directory
const publicDir = path.join(__dirname, 'dist', 'public');
const clientDir = path.join(__dirname, 'dist', 'client');

if (fs.existsSync(publicDir)) {
  console.log('Copying from dist/public to dist/client...');
  // Create client dir if it doesn't exist
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }

  // Copy all files from public to client
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    const sourcePath = path.join(publicDir, file);
    const destPath = path.join(clientDir, file);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      // Recursively copy directory
      fs.cpSync(sourcePath, destPath, { recursive: true });
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, destPath);
    }
  });
  console.log('Files copied successfully');
}

// Ensure _redirects file exists in dist/client
const redirectsPath = path.join(clientDir, '_redirects');
if (!fs.existsSync(redirectsPath)) {
  console.log('Creating _redirects in dist/client...');
  fs.writeFileSync(redirectsPath, '/* /index.html 200');
}

console.log('Post-build tasks completed');
`;

fs.writeFileSync(postBuildScriptPath, postBuildScript);
console.log('Post-build script created');