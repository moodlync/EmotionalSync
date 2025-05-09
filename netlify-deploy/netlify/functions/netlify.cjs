// This file helps Netlify identify the correct entry point when serverless-http fails
// Netlify will look for netlify.js or netlify.cjs first
// CommonJS version with diagnostic capabilities

const fs = require('fs');
const path = require('path');

// Function to list files in the current directory for debugging
const listDirectoryContents = () => {
  try {
    const files = fs.readdirSync(__dirname);
    return {
      directory: __dirname,
      files: files.map(file => {
        const stats = fs.statSync(path.join(__dirname, file));
        return {
          name: file,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size
        };
      })
    };
  } catch (error) {
    return { error: error.message };
  }
};

// Import the API handler from api.cjs
const apiHandler = require('./api.cjs').handler;

// Export the handler with diagnostic capabilities
exports.handler = async (event, context) => {
  // If requesting diagnostics, return directory contents
  if (event.path === '/.netlify/functions/netlify-debug') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'MoodLync Netlify Diagnostic Information (CJS)',
        timestamp: new Date().toISOString(),
        directoryContents: listDirectoryContents(),
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'undefined',
          NODE_VERSION: process.version
        }
      }, null, 2),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
  
  // Otherwise, delegate to the main API handler
  try {
    return await apiHandler(event, context);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Netlify function error (CJS)',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};