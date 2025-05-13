/**
 * Enhanced Netlify build fix script
 * This script runs before the build process to fix known issues
 * and adds better error logging for debugging
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======= NETLIFY BUILD DEBUG =======');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
console.log('Listing top-level directories and files:');
try {
  const files = fs.readdirSync('.');
  files.forEach(file => {
    const stats = fs.statSync(file);
    console.log(`- ${file} (${stats.isDirectory() ? 'directory' : 'file'})`);
  });
} catch (error) {
  console.error('Error listing files:', error.message);
}

// Check specific directories
const dirsToCheck = ['client', 'server', 'shared'];
dirsToCheck.forEach(dir => {
  console.log(`Checking ${dir} directory:`);
  try {
    if (fs.existsSync(dir)) {
      console.log(`✓ ${dir} directory exists`);
      if (dir === 'client' && fs.existsSync(`${dir}/src`)) {
        console.log('Listing src files in client:');
        const srcFiles = fs.readdirSync(`${dir}/src`);
        srcFiles.slice(0, 5).forEach(file => console.log(`  - ${file}`));
        if (srcFiles.length > 5) console.log(`  ... and ${srcFiles.length - 5} more files`);
      }
    } else {
      console.error(`✗ ${dir} directory not found!`);
    }
  } catch (error) {
    console.error(`Error checking ${dir} directory:`, error.message);
  }
});

// We don't modify package.json directly, instead we work with the deploy-package.json
console.log('Checking for deploy-package.json...');
if (fs.existsSync('./deploy-package.json')) {
  console.log('Found deploy-package.json for Netlify build');
  // Optionally copy it for use
  fs.copyFileSync('./deploy-package.json', './package.json.netlify');
  console.log('Copied deploy-package.json to package.json.netlify for reference');
}

// Check for compilation issues in key components
console.log('Checking for potential compilation issues...');
const problematicComponents = [
  './client/src/components/user-nft-collection.tsx',
  './client/src/components/premium-features/user-nft-collection.tsx',
  './client/src/components/premium-features/emotional-imprints.tsx',
  './client/src/components/notifications/notification-bell.tsx',
  './client/src/hooks/use-mood-context.tsx'
];

problematicComponents.forEach(componentPath => {
  if (fs.existsSync(componentPath)) {
    console.log(`Found ${componentPath}`);
    // Read first few lines to check imports
    try {
      const content = fs.readFileSync(componentPath, 'utf-8');
      const lines = content.split('\n').slice(0, 10);
      console.log(`First few lines of ${path.basename(componentPath)}:`);
      lines.forEach(line => console.log(`  ${line}`));
    } catch (err) {
      console.error(`Error reading ${componentPath}:`, err.message);
    }
  } else {
    console.log(`Component ${componentPath} not found, skipping...`);
  }
});

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
console.log('Installing all required build dependencies...');
try {
  execSync('npm install --no-save @vitejs/plugin-react vite autoprefixer postcss tailwindcss @types/react @types/react-dom typescript', { stdio: 'inherit' });
  console.log('Build dependencies installed');
} catch (error) {
  console.error('Error installing build dependencies:', error.message);
}

console.log('Netlify build fix completed successfully!');

// Create a detailed post-build script to move files and log errors
const postBuildScriptPath = './netlify-post-build.cjs';
console.log('Creating enhanced post-build script...');
const postBuildScript = `
const fs = require('fs');
const path = require('path');

console.log('======= NETLIFY POST-BUILD DEBUG =======');
console.log('Running post-build tasks...');

// Check build output directories
console.log('Checking build output directories:');
const directoriesToCheck = [
  'dist',
  'dist/client',
  'dist/public'
];

directoriesToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(\`✓ \${dir} exists\`);
    try {
      const files = fs.readdirSync(dir);
      console.log(\`  Contains \${files.length} files/directories\`);
      if (files.length < 10) {
        files.forEach(file => console.log(\`    - \${file}\`));
      } else {
        files.slice(0, 5).forEach(file => console.log(\`    - \${file}\`));
        console.log(\`    ... and \${files.length - 5} more\`);
      }
    } catch (err) {
      console.error(\`  Error reading \${dir}: \${err.message}\`);
    }
  } else {
    console.error(\`✗ \${dir} does not exist!\`);
  }
});

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
  try {
    const files = fs.readdirSync(publicDir);
    files.forEach(file => {
      const sourcePath = path.join(publicDir, file);
      const destPath = path.join(clientDir, file);
      
      try {
        if (fs.statSync(sourcePath).isDirectory()) {
          // Recursively copy directory
          fs.cpSync(sourcePath, destPath, { recursive: true });
        } else {
          // Copy file
          fs.copyFileSync(sourcePath, destPath);
        }
        console.log(\`Copied: \${file}\`);
      } catch (err) {
        console.error(\`Error copying \${file}: \${err.message}\`);
      }
    });
    console.log(\`Files copied successfully: \${files.length} items\`);
  } catch (err) {
    console.error(\`Error reading directory \${publicDir}: \${err.message}\`);
  }
}

// Ensure _redirects file exists in dist/client
const redirectsPath = path.join(clientDir, '_redirects');
if (!fs.existsSync(redirectsPath)) {
  console.log('Creating _redirects in dist/client...');
  fs.writeFileSync(redirectsPath, '/* /index.html 200');
}

console.log('Post-build tasks completed');
console.log('======= END NETLIFY POST-BUILD DEBUG =======');
`;

fs.writeFileSync(postBuildScriptPath, postBuildScript);
console.log('Post-build script created');