// Centralized error handler for Netlify functions
// This utility helps capture and report errors from Netlify Functions

// Standalone handler for Netlify Functions
export const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'MoodLync error handler utility',
      path: event.path,
      timestamp: new Date().toISOString()
    })
  };
};

/**
 * Wraps a Netlify function handler with error handling
 * @param {Function} handler - The original Netlify function handler
 * @returns {Function} - Enhanced handler with error handling
 */
export const withErrorHandling = (handler) => {
  return async (event, context) => {
    try {
      // Call the original handler
      return await handler(event, context);
    } catch (error) {
      console.error('Function error:', error);
      
      // Return a structured error response
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Server Error',
          message: error.message || 'Unknown error occurred',
          path: event.path,
          timestamp: new Date().toISOString()
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
  };
};

/**
 * Logs errors during function execution
 * @param {Error} error - The error to log
 * @param {Object} context - Additional information about where the error occurred
 */
export const logError = (error, context = {}) => {
  console.error(
    JSON.stringify({
      type: 'FUNCTION_ERROR',
      message: error.message,
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString()
    })
  );
};

/**
 * Creates a standardized API error response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details
 * @returns {Object} Formatted error response
 */
export const createErrorResponse = (statusCode, message, details = {}) => {
  return {
    statusCode,
    body: JSON.stringify({
      error: true,
      message,
      details,
      timestamp: new Date().toISOString()
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
};