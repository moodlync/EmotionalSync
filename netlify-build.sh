#!/bin/bash
# Custom build script for Netlify deployment

# Set NODE_ENV to production to disable development plugins
export NODE_ENV=production

echo "Starting Netlify build process..."

# Run the fix-imports.sh script first
echo "Running import fixes..."
./fix-imports.sh

echo "Netlify build completed successfully!"