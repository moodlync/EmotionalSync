// MoodLync Netlify Authentication Configuration
// This file provides Netlify-specific authentication paths

// Helper to handle Netlify-specific authentication paths
export function getNetlifyAuthPaths() {
  return {
    login: "/.netlify/functions/api/login",
    logout: "/.netlify/functions/api/logout",
    register: "/.netlify/functions/api/register",
    user: "/.netlify/functions/api/user",
    verifyEmail: "/.netlify/functions/api/verify-email",
    resendVerification: "/.netlify/functions/api/resend-verification"
  };
}

// Helper to determine if current environment is Netlify
export function isNetlifyEnvironment() {
  return typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
}

// Helper to determine if we're in Replit environment
export function isReplitEnvironment() {
  return typeof window !== 'undefined' && 
    (window.location.hostname.includes('replit.dev') || 
     window.location.hostname.includes('repl.co') ||
     window.location.hostname.includes('replit.app'));
}

// Helper to get the correct API path based on environment
export function getApiPath(endpoint: string): string {
  const isNetlify = isNetlifyEnvironment();
  const isReplit = isReplitEnvironment();
  
  console.log(`Environment check - Netlify: ${isNetlify}, Replit: ${isReplit}, Hostname: ${window.location.hostname}`);
  
  const paths = isNetlify ? getNetlifyAuthPaths() : {
    login: "/api/login",
    logout: "/api/logout",
    register: "/api/register",
    user: "/api/user",
    verifyEmail: "/api/verify-email",
    resendVerification: "/api/resend-verification"
  };
  
  if (isNetlify) {
    // Convert standard endpoints to Netlify endpoints
    switch (endpoint) {
      case "/api/login": return paths.login;
      case "/api/logout": return paths.logout;
      case "/api/register": return paths.register;
      case "/api/user": return paths.user;
      case "/api/verify-email": return paths.verifyEmail;
      case "/api/resend-verification": return paths.resendVerification;
      default:
        // Handle other API endpoints
        if (endpoint.startsWith('/api/')) {
          return `/.netlify/functions/api/${endpoint.slice(5)}`;
        }
        return endpoint;
    }
  }
  
  // For Replit environment, ensure we're using the correct port
  if (isReplit) {
    // Make sure we use the full path with the current origin
    // This ensures we're connecting to the correct port (3000)
    const currentOrigin = window.location.origin;
    console.log(`Using Replit environment with origin: ${currentOrigin}`);
    return `${currentOrigin}${endpoint}`;
  }
  
  // Return original endpoint for other environments
  return endpoint;
}