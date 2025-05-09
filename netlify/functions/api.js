const serverless = require('serverless-http');
const { app } = require('../../server/index.ts');

// Create handler for Netlify Functions
const handler = serverless(app);

module.exports = { handler };