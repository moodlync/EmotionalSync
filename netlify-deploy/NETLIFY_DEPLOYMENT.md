# MoodLync Netlify Deployment Guide

This guide provides step-by-step instructions for deploying MoodLync to Netlify, along with troubleshooting tips for common issues.

## Prerequisites

- A Netlify account
- Node.js 20 installed locally (for testing deployment package)
- Git (optional)

## Deployment Steps

### 1. Prepare the Deployment Package

The optimized deployment package is already created for you in the `moodsync-netlify-deploy.tar.gz` file.

1. Download the `moodsync-netlify-deploy.tar.gz` file from your Replit project
2. Extract it on your computer:
   ```
   tar -xzf moodsync-netlify-deploy.tar.gz
   ```
3. The extracted directory `netlify-deploy` contains all the necessary files for deployment

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify UI

1. Log in to your Netlify account
2. Click on "Add new site" > "Deploy manually"
3. Drag and drop the `netlify-deploy` folder to the designated area
4. Wait for the initial upload to complete
5. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
6. Click "Deploy site"

#### Option B: Deploy via Netlify CLI

1. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```
2. Navigate to the extracted directory:
   ```
   cd netlify-deploy
   ```
3. Login to Netlify:
   ```
   netlify login
   ```
4. Initialize the site:
   ```
   netlify init
   ```
5. Follow the prompts to create a new site or select an existing one
6. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/public`
7. Deploy the site:
   ```
   netlify deploy --prod
   ```

### 3. Set Environment Variables

After deployment, you need to set up environment variables in Netlify:

1. Go to your site's dashboard in Netlify
2. Navigate to Site settings > Environment variables
3. Add the following environment variables:
   - `NODE_VERSION`: 20 (required)
   - `NPM_CONFIG_LEGACY_PEER_DEPS`: true (recommended for build optimization)
   - `BROWSERSLIST_IGNORE_OLD_DATA`: true (prevents browserslist warnings)
   - `DATABASE_URL`: Your database connection string (if using a database)
   - `SESSION_SECRET`: A long random string for securing session cookies 
   - `SENDGRID_API_KEY`: Your SendGrid API key (if using email functionality)
   - `ANTHROPIC_API_KEY`: Your Anthropic API key (if using AI functionality)
   - `OPENAI_API_KEY`: Your OpenAI API key (if using AI functionality)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key (if using payment functionality)
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key (if using payment functionality)
   - `PERPLEXITY_API_KEY`: Your Perplexity API key (if using AI chat functionality)

4. After setting environment variables, trigger a new deployment by clicking "Trigger deploy" in the Netlify dashboard

You can use the included `netlify-env-setup.sh` script for guidance on setting up these variables.

## Troubleshooting

### Page Not Found Errors

If you're getting "Page not found" errors when navigating to routes in your deployed app:

1. Check that your `netlify.toml` file has the correct client-side routing configuration:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Verify the publish directory is correctly set to `dist/public` in your Netlify site settings

3. Access the diagnostic page at `<your-site-url>/netlify-debug` to get insights into the deployment environment

### API Connection Issues

If your frontend can't connect to the API endpoints:

1. Check your environment detection settings by accessing the new debug endpoint at `<your-site-url>/api/environment`
   This will show you detailed information about how the environment is being detected.

2. Ensure the API redirects are properly configured in `netlify.toml`:
   ```toml
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/api/:splat"
     status = 200
     force = true
   ```

3. Test your API functions directly by accessing:
   - `<your-site-url>/.netlify/functions/api/health` (API health check)
   - `<your-site-url>/api/health` (Redirected health check)
   - `<your-site-url>/netlify-debug` (Netlify environment diagnostics)

4. Verify CORS headers are properly set in browser dev tools (Network tab)
   The responses should include the following headers:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With`

5. Verify that all required environment variables for your API are set in the Netlify dashboard

6. Check for any errors in the Netlify function logs (accessible from your Netlify dashboard under Functions)

### Build Failures

If your build is failing on Netlify:

1. Check the build logs in the Netlify dashboard for error messages
   
2. Make sure you have the correct Node.js version set in your environment variables (`NODE_VERSION=20`)
   
3. Verify that the build command is correctly set to `npm run build`
   
4. Ensure all required dependencies are included in the `package.json` file

### Module Not Found Errors

If you see "Module not found" errors in your deployed app:

1. Check that all required dependencies are listed in `package.json`
   
2. Ensure ESM/CommonJS compatibility issues are addressed (the deployment package includes both `.js` and `.cjs` versions of server files)
   
3. Verify that the imports in your code use the correct path aliases that match the ones configured in `vite.config.ts`

## Additional Resources

If you encounter issues not covered in this guide:

1. Visit the diagnostic page at `<your-site-url>/netlify-debug` for detailed environment information
   
2. Check Netlify's documentation on [Functions](https://docs.netlify.com/functions/overview/) and [Redirects](https://docs.netlify.com/routing/redirects/)
   
3. Examine the build logs in the Netlify dashboard for specific error messages

## Support

If you continue to experience issues with your Netlify deployment, please:

1. Take note of any specific error messages
   
2. Capture the output from the diagnostic page at `/netlify-debug`
   
3. Contact support with these details for personalized assistance