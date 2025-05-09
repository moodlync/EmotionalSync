// This file helps Netlify identify the correct entry point when serverless-http fails
// Netlify will look for netlify.js or netlify.cjs first
// ESM version with diagnostic capabilities

import { handler as apiHandler } from './api.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Function to list files in the current directory for debugging
const listDirectoryContents = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
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

// Export the handler with fallback for diagnostics
export const handler = async (event, context) => {
  // If requesting diagnostics, return directory contents
  if (event.path === '/.netlify/functions/netlify-debug') {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'MoodLync Netlify Diagnostic Information',
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
        error: 'Netlify function error',
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