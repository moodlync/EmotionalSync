#!/bin/bash

# Script to prepare an optimized deployment package for Netlify
echo "==== Preparing optimized Netlify deployment package ===="

# Create deployment directory
DEPLOY_DIR="netlify-deploy"
mkdir -p $DEPLOY_DIR

# Copy essential files for Netlify deployment
echo "Copying essential files..."
cp deploy-package.json $DEPLOY_DIR/package.json
cp netlify.toml $DEPLOY_DIR/
cp .nvmrc $DEPLOY_DIR/
cp .tool-versions $DEPLOY_DIR/ 2>/dev/null || :
cp .mise.toml $DEPLOY_DIR/ 2>/dev/null || :
cp .mise.config.toml $DEPLOY_DIR/ 2>/dev/null || :
cp .mise-disable-warning $DEPLOY_DIR/ 2>/dev/null || :
cp netlify-build-fix.cjs $DEPLOY_DIR/
chmod +x $DEPLOY_DIR/netlify-build-fix.cjs

# Copy netlify directory with functions
echo "Copying Netlify functions..."
cp -r netlify $DEPLOY_DIR/

# Ensure all necessary files for Netlify functions are present
echo "Ensuring all Netlify function files are present..."
mkdir -p $DEPLOY_DIR/netlify/functions
touch $DEPLOY_DIR/netlify/functions/.npmrc
chmod +x $DEPLOY_DIR/netlify/functions/install.js

# Ensure CJS fallback files are included
if [ -f netlify/functions/api.cjs ]; then
  echo "Including serverless-http CJS fallback solutions..."
  cp netlify/functions/api.cjs $DEPLOY_DIR/netlify/functions/
  cp netlify/functions/netlify.js $DEPLOY_DIR/netlify/functions/
fi

# Create package-lock for functions to ensure dependencies are installed correctly
echo "Setting up Netlify functions dependencies..."
cd $DEPLOY_DIR/netlify/functions 
npm install --package-lock-only --no-audit --no-fund
cd ../../../

# Copy client source files (needed for build)
echo "Copying client source files..."
mkdir -p $DEPLOY_DIR/client
cp -r client/src $DEPLOY_DIR/client/
cp -r client/public $DEPLOY_DIR/client/
cp client/index.html $DEPLOY_DIR/client/
cp client/tsconfig.json $DEPLOY_DIR/client/ 2>/dev/null || :

# Copy server source files
echo "Copying server source files..."
mkdir -p $DEPLOY_DIR/server
cp -r server/src $DEPLOY_DIR/server/ 2>/dev/null || :
cp -r server/*.ts $DEPLOY_DIR/server/

# Copy shared files
echo "Copying shared files..."
mkdir -p $DEPLOY_DIR/shared
cp -r shared $DEPLOY_DIR/

# Copy config files
echo "Copying configuration files..."
cp tsconfig.json $DEPLOY_DIR/ 2>/dev/null || :
cp vite.config.ts $DEPLOY_DIR/
cp postcss.config.js $DEPLOY_DIR/ 2>/dev/null || :
cp tailwind.config.ts $DEPLOY_DIR/ 2>/dev/null || :
cp drizzle.config.ts $DEPLOY_DIR/ 2>/dev/null || :
cp components.json $DEPLOY_DIR/ 2>/dev/null || :
cp capacitor.config.ts $DEPLOY_DIR/ 2>/dev/null || :

# Copy select assets that are needed (assuming most assets are in public or client/public)
echo "Copying selective assets..."
mkdir -p $DEPLOY_DIR/attached_assets
cp attached_assets/*.svg $DEPLOY_DIR/attached_assets/ 2>/dev/null || :
cp attached_assets/logo*.* $DEPLOY_DIR/attached_assets/ 2>/dev/null || :

# Create a README for deployment
echo "Creating deployment README..."
cat > $DEPLOY_DIR/README.md << 'EOF'
# MoodSync Deployment Package

This is an optimized package for deploying MoodSync to Netlify.

## Deployment Steps

1. Upload this directory to Netlify
2. Set the build command to: `npm run build`
3. Set the publish directory to: `dist/public`
4. Configure environment variables:
   - Run the included script: `./netlify-env-setup.sh` for guidance
   - Add necessary environment variables in the Netlify dashboard
   - Make sure to set NODE_VERSION=18.18.0 to avoid Node version errors
5. See NETLIFY_DEPLOYMENT.md for detailed instructions and troubleshooting

Note: This package includes only the essential files needed for building and deploying the application.
EOF

# Copy the deployment guide and environment setup script
cp NETLIFY_DEPLOYMENT.md $DEPLOY_DIR/
cp netlify-env-setup.sh $DEPLOY_DIR/
chmod +x $DEPLOY_DIR/netlify-env-setup.sh

echo "Creating .gitignore for deployment package..."
cat > $DEPLOY_DIR/.gitignore << 'EOF'
node_modules
dist
.env
EOF

# Create tarball file
echo "Creating deployment tarball file..."
tar -czf moodsync-netlify-deploy.tar.gz $DEPLOY_DIR

# Output instructions
echo ""
echo "==== Deployment package ready! ===="
echo "Created: moodsync-netlify-deploy.tar.gz"
echo ""
echo "To deploy to Netlify:"
echo "1. Download the tarball file"
echo "2. Extract it on your computer (tar -xzf moodsync-netlify-deploy.tar.gz)"
echo "3. Follow the instructions in NETLIFY_DEPLOYMENT.md"
echo ""
echo "Package size: $(du -sh moodsync-netlify-deploy.tar.gz | cut -f1)"
echo ""