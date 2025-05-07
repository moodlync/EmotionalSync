#!/bin/bash
# This script helps set up critical environment variables for Netlify deployment

echo "Setting up essential Netlify environment variables..."

# Navigate to your Netlify site settings and add these environment variables:

echo "=== NODE VERSION SETTINGS ==="
echo "Variable: NODE_VERSION"
echo "Value: 18.18.0"
echo "This ensures Netlify uses a valid Node.js version during build"
echo ""

echo "=== BUILD OPTIMIZATION SETTINGS ==="
echo "Variable: NPM_CONFIG_LEGACY_PEER_DEPS"
echo "Value: true"
echo "This prevents dependency resolution issues"
echo ""

echo "Variable: NPM_CONFIG_AUDIT"
echo "Value: false"
echo "This speeds up builds by skipping npm audit"
echo ""

echo "=== DATABASE CONNECTION ==="
echo "Variable: DATABASE_URL"
echo "Value: [Your PostgreSQL connection string]"
echo "Example: postgresql://user:password@hostname:port/database?sslmode=require"
echo ""

echo "=== STRIPE PAYMENT PROCESSING ==="
echo "Variable: STRIPE_SECRET_KEY"
echo "Value: [Your Stripe secret key starting with sk_]"
echo ""

echo "Variable: VITE_STRIPE_PUBLIC_KEY"
echo "Value: [Your Stripe publishable key starting with pk_]"
echo "This variable must be prefixed with VITE_ to be accessible in the frontend"
echo ""

echo "=== ADDITIONAL SETTINGS ==="
echo "Variable: SESSION_SECRET"
echo "Value: [A long random string for securing session cookies]"
echo "Example: 431e2b217d1b715a1b93e96c05de055b7473812c6bfd7e951a690b8a312fd8e7"
echo ""

echo "Remember: Netlify environment variables can be set via the Netlify dashboard:"
echo "Site settings → Environment → Environment variables"
echo ""