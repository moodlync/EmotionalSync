#!/bin/bash
# Enhanced Netlify build script to fix common build issues and provide better error handling

set -e
echo "===== NETLIFY BUILD PROCESS STARTING ====="

# Make sure node and npm are available
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install all required dependencies using our dedicated installer
echo "Installing all required dependencies using dedicated installer..."
node netlify-package-install.js

# Run the build fix script
echo "Running build fix script..."
node netlify-build-fix.cjs

# Setup proper environment variables
export NODE_ENV=production
export VITE_BUILD_MODE=production

# Create a custom build script for Netlify
echo "Creating custom build script for Netlify..."
cat > netlify-vite-build.js << 'EOL'
const { build } = require('vite');
const fs = require('fs');
const path = require('path');

// Check for custom Netlify config
const configPath = fs.existsSync('./vite.netlify.config.js')
  ? './vite.netlify.config.js'
  : './vite.config.ts';

console.log(`Using Vite config from: ${configPath}`);

async function buildApp() {
  try {
    await build({
      configFile: configPath,
      mode: 'production',
      logLevel: 'info'
    });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

buildApp();
EOL

# Run the actual build with detailed error output
echo "Starting build process with custom Vite configuration..."
node netlify-vite-build.js > build.log 2>&1 || {
  echo "Build failed! Error details:"
  cat build.log
  echo "Last 50 lines of build log:"
  tail -n 50 build.log
  echo "===== BUILD ERRORS DETECTED ====="
  exit 1
}

# Run post-build tasks
echo "Running post-build tasks..."
node netlify-post-build.cjs

# Create index.html if it doesn't exist in the output directory
echo "Ensuring dist/client/index.html exists..."
if [ ! -f "dist/client/index.html" ]; then
  echo "WARNING: index.html not found in build output, creating a minimal one..."
  mkdir -p dist/client
  cat > dist/client/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MoodLync</title>
  <script>
    // Redirect to the proper build location if available
    if (window.location.pathname === '/' && window.location.hash === '') {
      const possibleLocations = ['/index.html', '/app.html', '/client/index.html'];
      for (const location of possibleLocations) {
        fetch(location, {method: 'HEAD'})
          .then(response => {
            if (response.ok) {
              window.location.href = location;
            }
          })
          .catch(err => console.error('Path check failed:', err));
      }
    }
  </script>
</head>
<body>
  <div id="app">
    <h1>MoodLync</h1>
    <p>Loading application...</p>
  </div>
</body>
</html>
EOL
fi

# Ensure _redirects is in the build output
echo "Ensuring _redirects file exists in build output..."
cp _redirects dist/client/ || echo "/* /index.html 200" > dist/client/_redirects

echo "Build completed successfully!"
echo "===== NETLIFY BUILD PROCESS COMPLETE ====="
