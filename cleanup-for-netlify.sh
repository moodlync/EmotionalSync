#!/bin/bash

echo "Starting MoodLync cleanup for Netlify deployment..."

# Remove multiple versions of helper files
echo "Removing duplicate helper files..."
rm -f createPasswordHash.js createPasswordHash.cjs
rm -f update-workflow.cjs

# Remove large Netlify deployment archives
echo "Removing Netlify deployment archives..."
rm -f moodsync-netlify-deploy.tar.gz

# Clean up netlify-deploy directory
echo "Cleaning up netlify-deploy directory..."
rm -rf netlify-deploy

# Streamline Netlify function files (keep only necessary ones)
echo "Streamlining Netlify function files..."
rm -f netlify/functions/install.cjs netlify/functions/install.mjs
rm -f netlify/functions/error-handler.cjs

# Remove duplicate package definitions
echo "Removing duplicate package definitions..."
rm -f deploy-package.json

# Remove unnecessary scripts
echo "Removing additional helper scripts..."
rm -f update-premium-icons.js push-admin-schema.js
rm -f ensure-assets.cjs netlify-build-fix.cjs netlify-build-fix.js

echo "Final check for port-related files..."
find . -name "port-*" -o -name "replit-*" -o -name "workflow-*" | xargs rm -f 2>/dev/null

echo "Cleanup for Netlify deployment complete! The application should now deploy properly."