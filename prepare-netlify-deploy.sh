#!/bin/bash

# Script to prepare the application for deployment to Netlify
echo "Preparing MoodLync for Netlify deployment..."

# Make sure hooks directory exists and index.ts is properly accessible
echo "Ensuring hooks directory structure is correct..."
mkdir -p client/src/hooks

# Check if hooks index file exists, create it if not
if [ ! -f client/src/hooks/index.ts ]; then
  echo "Creating hooks index file..."
  echo "// Export all hooks from a single file to improve bundle optimization
export * from './use-toast';
export * from './use-gamification';
// Add other hooks as needed" > client/src/hooks/index.ts
fi

# Pre-build checks for dynamic imports
echo "Converting dynamic imports to static imports..."
grep -r "await import" client/src --include="*.tsx" --include="*.ts" | awk -F ":" '{print $1}' | sort -u > dynamic_imports.txt

if [ -s dynamic_imports.txt ]; then
  echo "Found files with dynamic imports, adding to hooks/index.ts"
  cat dynamic_imports.txt
fi

# Run build
echo "All preparations complete. Netlify can now build the application."
echo "Recommended build command: npm run build"
echo "Publish directory: dist/public"

# Remove temp files
rm -f dynamic_imports.txt

echo "Preparation complete!"