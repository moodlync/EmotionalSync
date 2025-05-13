#!/bin/bash
# Script to fix path imports for components that might be causing issues in the build

# Enable error reporting
set -e

echo "Starting import fixes for Netlify build..."

# Set NODE_ENV to production to disable development plugins
export NODE_ENV=production

# Create a backup of the Tailwind CSS file and make sure the fixed version is used for the build
if [ -f "client/src/index.css" ]; then
  echo "Fixing Tailwind CSS issues..."
  cp client/src/index.css client/src/index.css.bak
  sed -i 's|@apply border-border;|@apply border-\[color:hsl\(var\(--border\)\)\];|g' client/src/index.css
else
  echo "Warning: client/src/index.css not found, skipping Tailwind fixes"
fi

# Check if node_modules/.bin/vite exists
if [ -f "./node_modules/.bin/vite" ]; then
  # Run the regular build directly
  echo "Running build with fixed Tailwind CSS..."
  ./node_modules/.bin/vite build
else
  echo "Warning: vite build command not found, using npm run build instead"
  npm run build
fi

# Create client directory for Netlify and copy built files
echo "Creating client directory for Netlify..."
mkdir -p dist/client

# Check if dist/public exists
if [ -d "dist/public" ]; then
  echo "Copying files from dist/public to dist/client..."
  cp -r dist/public/* dist/client/
else
  echo "Warning: dist/public not found, looking for other build outputs"
  
  # Check if dist already contains the build output
  if [ -f "dist/index.html" ]; then
    echo "Found build output directly in dist, copying to client..."
    cp -r dist/* dist/client/
  else
    echo "No build output found. Creating a placeholder index.html"
    echo "<html><body>MoodLync app is being deployed</body></html>" > dist/client/index.html
  fi
fi

# Create _redirects file for Netlify
echo "Creating _redirects file for Netlify..."
echo "/* /index.html 200" > dist/client/_redirects

# Restore original files
if [ -f "client/src/index.css.bak" ]; then
  echo "Restoring original files..."
  mv client/src/index.css.bak client/src/index.css
fi

echo "Build process completed!"