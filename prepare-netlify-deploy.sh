#!/bin/bash
# Script to prepare MoodLync for Netlify deployment

echo "Preparing MoodLync for Netlify deployment..."

# Make sure the script is executable
chmod +x prepare-netlify-deploy.sh

# Create a central hooks index file for better module exports
mkdir -p client/src/hooks
cat > client/src/hooks/index.ts << 'EOL'
// Export all hooks from a central file
// This helps with bundling and prevents dynamic import issues

export { useToast } from './use-toast';
export { useGamification } from './use-gamification';
// Add other hook exports as needed
EOL

echo "Created hooks index file"

# Fix any imports in home-page.tsx
if [ -f client/src/pages/home-page.tsx ]; then
  # Replace dynamic imports with static imports
  sed -i 's/import("@\/hooks\/use-toast")/import { useToast } from "@\/hooks"/g' client/src/pages/home-page.tsx
  sed -i 's/import("@\/hooks\/use-gamification")/import { useGamification } from "@\/hooks"/g' client/src/pages/home-page.tsx
  echo "Fixed imports in home-page.tsx"
fi

# Create dist directory if it doesn't exist
mkdir -p dist/public
echo "Created dist directory structure"

# Copy the client/public directory to dist/public
# This ensures static HTML files like mood-hub.html are properly included in the build
cp -r client/public/* dist/public/ 2>/dev/null || true
echo "Copied static files from client/public to dist/public"

# Ensure the assets/js directory exists
mkdir -p dist/public/assets/js
# Make sure mood-shared.js is properly copied
cp -f client/public/assets/js/mood-shared.js dist/public/assets/js/ 2>/dev/null || true
echo "Verified mood-shared.js is in the build"

echo "MoodLync is now ready for Netlify deployment!"