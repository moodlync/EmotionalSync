#!/bin/bash
# Direct Netlify SPA build script for MoodLync

# Enable error reporting
set -e

echo "Starting Netlify SPA build process..."

# Set NODE_ENV to production
export NODE_ENV=production

# Run the NPM build script
echo "Running npm build..."
npm run build

# Ensure the Netlify deployment directory exists
mkdir -p dist/client

# Check where the build output is located
if [ -d "dist/public" ]; then
  echo "Copying files from dist/public to dist/client..."
  cp -r dist/public/* dist/client/
elif [ -f "dist/index.html" ]; then
  echo "Copying files from dist to dist/client..."
  # Don't copy the client directory into itself
  find dist -maxdepth 1 -not -name client -a -not -name "." -a -not -name ".." -exec cp -r {} dist/client/ \;
fi

# Create _redirects file for SPA routing
echo "Creating _redirects file..."
echo "/* /index.html 200" > dist/client/_redirects

# Create basic netlify.toml file for fallback
cat > dist/client/netlify.toml << EOL
# Handle client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = true
EOL

echo "Netlify SPA build completed successfully!"