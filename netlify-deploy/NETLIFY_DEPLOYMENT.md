# MoodSync Netlify Deployment Guide

This document provides step-by-step instructions for deploying MoodSync to Netlify.

## Prerequisites

Before you begin, ensure you have the following:

1. A Netlify account (sign up at [netlify.com](https://netlify.com))
2. Your Stripe API keys:
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (starts with `sk_`)
   - `VITE_STRIPE_PUBLIC_KEY` - Your Stripe publishable key (starts with `pk_`)
3. A PostgreSQL database (we recommend using Neon.tech for serverless PostgreSQL)
4. A GitHub account to host your repository (strongly recommended for easier deployment)

## Configuration Files

We've set up all the necessary configuration files for Netlify deployment:

- `netlify.toml` - Main configuration file for Netlify build settings and redirects
- `netlify/functions/api.js` - Serverless function to handle all API requests
- `netlify/headers.js` - Security headers configuration
- `client/src/utils/metadata-fixer.ts` - Utility to resolve Replit-specific metadata issues

## Deployment Steps

Follow these steps to deploy MoodSync on Netlify:

### 1. Set Up Your GitHub Repository

This method is strongly recommended over uploading a zip file:

1. Create a new GitHub repository
2. Push your MoodSync codebase to this repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

### 2. Connect to Netlify

1. Log in to your Netlify account
2. Click "New site from Git"
3. Connect to GitHub and select your MoodSync repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/client`

### 3. Set Environment Variables

In the Netlify site settings, add the following environment variables:

- `DATABASE_URL` - Your PostgreSQL connection string
- `SESSION_SECRET` - A secure random string for session encryption
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `VITE_STRIPE_PUBLIC_KEY` - Your Stripe publishable key 
- `NODE_ENV` - Set to "production"

### 4. Deploy

Click the "Deploy" button on Netlify and wait for the build to complete.

### 5. Configure Domain (Optional)

Set up a custom domain for your MoodSync application:

1. Go to the "Domain settings" section in your Netlify dashboard
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

## Alternative: Manual Deployment (Using Zip File)

If you prefer to deploy using a zip file instead of GitHub:

1. Make sure you've updated your code with the Replit metadata fix in `client/src/main.tsx` and `client/src/utils/metadata-fixer.ts`
2. Run a local build: `npm run build`
3. Create a zip file containing the following:
   - `dist/` directory
   - `netlify/` directory 
   - `netlify.toml` file
   - `package.json` file
4. In Netlify dashboard, go to Sites > Add new site > Deploy manually
5. Upload your zip file
6. Configure environment variables as described in section 3

## Testing Your Deployment

After successful deployment, test the following features:

1. User registration and login
2. Emotion tracking and matching
3. Premium subscriptions (payment processing)
4. NFT collection and token rewards
5. Admin panel functionality

## Troubleshooting

### Common Issues

1. **React Fragment Error**: If you see errors about invalid props on React Fragments, this is related to Replit-specific metadata attributes. The included fix in `metadata-fixer.ts` should resolve this.

2. **Missing Environment Variables**: Check that all required environment variables are set in the Netlify dashboard.

3. **Database Connection Issues**: Ensure your database is accessible from Netlify's servers. Neon.tech is recommended for serverless PostgreSQL that works well with Netlify.

4. **Build Failures**: Check the Netlify build logs for specific errors and fix them in your repository before redeploying.

5. **Node.js Version Issues**:
   - If you see an error like "Line 21 of the build logs shows that the build is using Node version v22.15.0, which is not a valid Node version," the deployment package now includes:
     - A `NODE_VERSION = "18.18.0"` setting in netlify.toml
     - An `.nvmrc` file with Node 18.18.0 specified
     - A proper `engines` field in package.json
     - The `USE_IDIOMATIC_VERSION_FILES = "true"` setting in netlify.toml
     - A `.mise.toml` configuration file with `idiomatic_version_files = true`
   
   If Node version issues persist:
   - Manually set the Node.js version in Netlify site settings under "Environment" → "Environment variables": add `NODE_VERSION` with value `18.18.0`
   - Also add the environment variable `USE_IDIOMATIC_VERSION_FILES` with value `true` 
   - You can also try Node 16.x or 20.x if 18.x doesn't work for some reason
   
   If you see warnings like "Automatic resolution through idiomatic version files like .nvmrc will be changed in a future release" or any warnings related to mise:
   - The configuration now includes both the environment variable and the `.mise.toml` file to explicitly enable idiomatic version files
   - If warnings persist, you can try adding a `.tool-versions` file with `nodejs 18.18.0` as a fallback
   - These warnings should not affect your build, but they might appear in logs

6. **Serverless Function Dependency Issues**:
   - If you encounter errors about missing `serverless-http` or `cors` dependencies, the following solutions have been implemented:
     - Enhanced `netlify.toml` build command that explicitly installs required dependencies
     - Custom installation script (`netlify/functions/install.js`) that handles dependency installation
     - CommonJS compatibility mode (`api.cjs`) that provides a fallback API implementation
     - Fallback entry point (`netlify.js`) that resolves to the CJS module when needed
     - `.npmrc` configuration in the functions directory to bypass audit warnings
   
   If these issues persist:
   - Run this build command manually in Netlify settings:
     ```
     export NPM_CONFIG_AUDIT=false && npm install --no-audit --legacy-peer-deps serverless-http cors express body-parser express-session memorystore uuid && NODE_ENV=production npm run build && node netlify/functions/install.js
     ```
   - Add the environment variable `NPM_CONFIG_LEGACY_PEER_DEPS=true` in Netlify settings
   - If the problem is specifically with `serverless-http`, try renaming `netlify/functions/api.cjs` to `netlify/functions/api.js` to force using the CommonJS version

7. **Vite Command Not Found Error**:
   - If you see an error like "sh: 1: vite: not found" (exit code 127), the issue is that Vite isn't accessible during the build. The following fixes have been implemented:
     - Automatic build-fix script (`netlify-build-fix.cjs`) that runs before the build
     - Updated build command that explicitly installs Vite and its dependencies
     - Fallback build.sh script as a last resort option

   If these issues persist:
   - Try updating the build command in Netlify settings to:
     ```
     export NPM_CONFIG_AUDIT=false && npm install && npm install --no-audit vite @vitejs/plugin-react typescript esbuild && NODE_ENV=production ./node_modules/.bin/vite build
     ```
   - Add the environment variable `PATH="./node_modules/.bin:$PATH"` in Netlify settings
   - If all else fails, use the included fallback script by changing the build command to:
     ```
     ./build.sh
     ```
     
8. **Missing Module/Package Errors**:
   - If your build fails with errors like "Cannot find module 'X'" or "Module not found: Error: Can't resolve 'Y'", the deployment package now includes:
     - Automatic source code scanning to detect import statements and install missing packages
     - Expanded list of 25+ common frontend and UI dependencies preinstalled
     - Intelligent package name extraction from import paths
   
   If missing module errors persist:
   - Check the build logs to identify the exact missing module
   - Add the specific missing package to the Netlify environment variable `INSTALL_EXTRA_PACKAGES` with a space-separated list, e.g., `package1 package2`
   - Try using the expanded build command that includes common React dependencies:
     ```
     export NPM_CONFIG_AUDIT=false && npm install --no-audit && npm install --no-audit react-icons tw-elements cmdk vaul recharts tailwind-merge react-day-picker && NODE_ENV=production npm run build
     ```
   - For last resort fixes, you may need to fork the repository, add the missing dependency to the package.json file, and deploy from your fork

### Getting Support

If you need assistance with your Netlify deployment, try these steps:

1. Check the Netlify documentation at [docs.netlify.com](https://docs.netlify.com)
2. Look at deployment logs in your Netlify dashboard
3. Contact our support team at support@moodsync.app with specific error messages