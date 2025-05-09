#!/bin/bash

# Update Netlify Deployment Script
# This script automates the process of updating both GitHub and Netlify with the latest changes

echo "==== MoodLync Deployment Update Script ===="

# Step 1: Ensure all assets and logos are properly managed
echo "Step 1: Running asset management script..."
node ensure-assets.cjs
echo "✅ Assets verified and updated"

# Step 2: Prepare the Netlify deployment package
echo "Step 2: Preparing Netlify deployment package..."
./prepare-netlify-deploy.sh
echo "✅ Netlify deployment package created"

# Step 3: Download the package for manual Netlify deployment
echo "Step 3: The Netlify deployment package is now ready"
echo "Download the file: moodsync-netlify-deploy.tar.gz"
echo "Extract it and deploy to Netlify following these steps:"

echo "
NETLIFY DEPLOYMENT INSTRUCTIONS:
--------------------------------
1. Download moodsync-netlify-deploy.tar.gz
2. Extract the file: tar -xzf moodsync-netlify-deploy.tar.gz
3. Go to Netlify dashboard: https://app.netlify.com
4. Drag and drop the extracted 'netlify-deploy' folder to deploy
5. Or use the Netlify CLI:
   - netlify deploy --dir=netlify-deploy --prod
"

echo "==== Deployment Update Completed ===="
echo "The latest changes are now ready for deployment to Netlify."