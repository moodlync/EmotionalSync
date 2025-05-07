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

### Getting Support

If you need assistance with your Netlify deployment, try these steps:

1. Check the Netlify documentation at [docs.netlify.com](https://docs.netlify.com)
2. Look at deployment logs in your Netlify dashboard
3. Contact our support team at support@moodsync.app with specific error messages