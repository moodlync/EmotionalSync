#!/bin/bash
# Script to fix path imports for components that might be causing issues in the build

echo "Starting import fixes for Netlify build..."

# Set NODE_ENV to production to disable development plugins
export NODE_ENV=production

# Create a backup of the Tailwind CSS file and make sure the fixed version is used for the build
echo "Fixing Tailwind CSS issues..."
cp client/src/index.css client/src/index.css.bak
sed -i 's|@apply border-border;|@apply border-\[color:hsl\(var\(--border\)\)\];|g' client/src/index.css

# Run the regular build directly
echo "Running build with fixed Tailwind CSS..."
./node_modules/.bin/vite build

# Create client directory for Netlify
echo "Creating client directory for Netlify..."
mkdir -p dist/client
cp -r dist/public/* dist/client/

# Restore original files
echo "Restoring original files..."
mv client/src/index.css.bak client/src/index.css

echo "Build process completed!"