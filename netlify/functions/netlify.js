// This file helps Netlify identify the correct entry point when serverless-http fails
// Netlify will look for netlify.js or netlify.cjs first
exports.handler = require('./api.cjs').handler;