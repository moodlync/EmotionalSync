// Port Configuration for MoodLync
// This module handles server port configuration with special rules for Replit

/**
 * Get the appropriate port configuration for the current environment
 * @returns {Object} Port configuration object with primaryPort, secondaryPort, and options
 */
export function getPortConfiguration() {
  // Check for Replit environment
  const isReplit = process.env.REPLIT_ENVIRONMENT === 'true' || process.env.IS_REPLIT === 'true';
  
  // Get the specified port from environment, or use default
  const envPort = process.env.PORT ? parseInt(process.env.PORT, 10) : null;
  
  // Configuration for Replit (force port 3000 for external access)
  if (isReplit) {
    return {
      primaryPort: 3000, // Replit webview expects port 3000
      secondaryPort: 5000, // Fallback port
      options: {
        host: '0.0.0.0', // Allow external connections
        backlog: 511, // Maximum length of the pending connections queue
        exclusive: false // Allow port sharing
      },
      isReplit: true
    };
  }
  
  // Configuration for other environments
  return {
    primaryPort: envPort || 5000,
    secondaryPort: 8080,
    options: {
      host: '0.0.0.0',
      backlog: 511,
      exclusive: false
    },
    isReplit: false
  };
}

/**
 * Configure server ports with fallback options
 * @param {Express} app - Express application
 * @param {Function} log - Logging function
 * @returns {Promise<Object>} Server info with port
 */
export async function configureServerPorts(app, log) {
  const config = getPortConfiguration();
  
  // Try primary port first
  try {
    log(`Attempting to start server on port ${config.primaryPort}...`);
    
    const server = await new Promise((resolve, reject) => {
      const httpServer = app.listen(config.primaryPort, config.options.host, () => {
        resolve(httpServer);
      });
      
      httpServer.on('error', (err) => {
        reject(err);
      });
    });
    
    log(`Server started successfully on port ${config.primaryPort}`);
    return {
      server,
      port: config.primaryPort,
      isReplit: config.isReplit
    };
  } catch (primaryError) {
    log(`Failed to start on primary port ${config.primaryPort}: ${primaryError.message}`);
    
    // Try secondary port if primary fails
    try {
      log(`Attempting to start server on secondary port ${config.secondaryPort}...`);
      
      const server = await new Promise((resolve, reject) => {
        const httpServer = app.listen(config.secondaryPort, config.options.host, () => {
          resolve(httpServer);
        });
        
        httpServer.on('error', (err) => {
          reject(err);
        });
      });
      
      log(`Server started successfully on port ${config.secondaryPort}`);
      return {
        server,
        port: config.secondaryPort,
        isReplit: config.isReplit
      };
    } catch (secondaryError) {
      log(`Failed to start on secondary port ${config.secondaryPort}: ${secondaryError.message}`);
      throw new Error(`Could not start server on any available port. Primary error: ${primaryError.message}, Secondary error: ${secondaryError.message}`);
    }
  }
}