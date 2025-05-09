// This file helps Netlify identify the correct entry point when serverless-http fails
// Netlify will look for netlify.js or netlify.cjs first
try {
  // Try to use the ESM version first
  exports.handler = require('./api.js').handler;
} catch (e) {
  console.log('Falling back to CJS version due to:', e.message);
  // Fallback to CJS version
  exports.handler = require('./api.cjs').handler;
}