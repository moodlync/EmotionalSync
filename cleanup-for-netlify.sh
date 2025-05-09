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
# Make sure we don't remove our fixed Netlify function files
rm -f netlify/functions/install.mjs
# Keep install.cjs and error-handler.js as we need them now

# Preserve deploy-package.json for Netlify builds
echo "Preserving deploy-package.json for Netlify builds..."
# deploy-package.json is now required

# Remove unnecessary scripts
echo "Removing additional helper scripts..."
rm -f update-premium-icons.js push-admin-schema.js
rm -f ensure-assets.cjs netlify-build-fix.cjs netlify-build-fix.js

echo "Final check for port-related files..."
find . -name "port-*" -o -name "replit-*" -o -name "workflow-*" | xargs rm -f 2>/dev/null

# Verify that all necessary Netlify function files exist
echo "Verifying Netlify function files..."
MISSING_FILES=0
for FILE in api.js api.cjs routes.js routes.cjs netlify.js netlify.cjs; do
  if [ ! -f netlify/functions/$FILE ]; then
    echo "WARNING: netlify/functions/$FILE is missing!"
    MISSING_FILES=1
  else
    echo "✅ netlify/functions/$FILE is present"
  fi
done

if [ $MISSING_FILES -eq 0 ]; then
  echo "All required Netlify function files are present."
  echo "Cleanup for Netlify deployment complete! The application should now deploy properly."
else
  echo "⚠️ Some required Netlify function files are missing. Deployment may fail."
  echo "Please fix the missing files before deploying."
fi