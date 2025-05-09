#!/usr/bin/env node
/**
 * Netlify Build Fix Script
 * Ensures environment is properly set up for build
 */
console.log('Running Netlify build environment fix...');
// Set NODE_ENV to production if not defined
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
  console.log('Set NODE_ENV to production');
}
console.log('Netlify build environment fix completed');
