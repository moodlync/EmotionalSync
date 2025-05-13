#!/bin/bash
# Custom build script for Netlify deployment

# Set NODE_ENV to production to disable development plugins
export NODE_ENV=production

# Run the build
./node_modules/.bin/vite build

# Create client directory for Netlify
mkdir -p dist/client
cp -r dist/public/* dist/client/

echo "Build completed successfully!"