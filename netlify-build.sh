#!/bin/bash
# Netlify build script to fix common build issues and provide better error handling

set -e
echo "===== NETLIFY BUILD PROCESS STARTING ====="

# Make sure node and npm are available
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install critical dependencies first
echo "Installing critical build dependencies..."
npm install --no-save @vitejs/plugin-react vite typescript @types/react @types/react-dom

# Run the build fix script first
echo "Running build fix script..."
node netlify-build-fix.cjs

# Setup proper environment variables
export NODE_ENV=production
export VITE_BUILD_MODE=production

# Run the actual build with detailed error output
echo "Starting build process..."
npm run build > build.log 2>&1 || {
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

echo "Build completed successfully!"
echo "===== NETLIFY BUILD PROCESS COMPLETE ====="
