#!/bin/bash
# Custom build script for Netlify deployment

# Enable error reporting
set -e

# Set NODE_ENV to production to disable development plugins
export NODE_ENV=production

echo "Starting Netlify build process..."

# Check if fix-imports.sh exists before trying to run it
if [ -f "./fix-imports.sh" ]; then
  # Make sure the fix-imports.sh script is executable
  chmod +x fix-imports.sh

  # Run the fix-imports.sh script
  echo "Running import fixes..."
  bash ./fix-imports.sh
else
  echo "Warning: fix-imports.sh not found, running build directly"
  
  # Create a backup of the Tailwind CSS file and make sure the fixed version is used for the build
  if [ -f "client/src/index.css" ]; then
    echo "Fixing Tailwind CSS issues..."
    cp client/src/index.css client/src/index.css.bak
    sed -i 's|@apply border-border;|@apply border-\[color:hsl\(var\(--border\)\)\];|g' client/src/index.css
  fi

  # Run the build directly
  npm run build
  
  # Restore original files if needed
  if [ -f "client/src/index.css.bak" ]; then
    echo "Restoring original files..."
    mv client/src/index.css.bak client/src/index.css
  fi
fi

# Ensure the dist/client directory exists
mkdir -p dist/client

# Copy build files to client directory if needed
if [ -d "dist/public" ] && [ ! -f "dist/client/index.html" ]; then
  echo "Copying build files to client directory..."
  cp -r dist/public/* dist/client/
fi

# Make sure we have the _redirects file for Netlify
echo "/* /index.html 200" > dist/client/_redirects

echo "Netlify build completed successfully!"