// Centralized error handler for Netlify functions (CommonJS version)
// This utility helps capture and report errors from Netlify Functions

/**
 * Wraps a Netlify function handler with error handling
 * @param {Function} handler - The original Netlify function handler
 * @returns {Function} - Enhanced handler with error handling
 */
const withErrorHandling = (handler) => {
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
const logError = (error, context = {}) => {
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
const createErrorResponse = (statusCode, message, details = {}) => {
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

// Export the functions for CommonJS usage
module.exports = {
  withErrorHandling,
  logError,
  createErrorResponse
};