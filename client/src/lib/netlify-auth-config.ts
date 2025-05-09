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

// Helper to get the correct API path based on environment
export function getApiPath(endpoint: string): string {
  const isNetlify = isNetlifyEnvironment();
  const paths = isNetlify ? getNetlifyAuthPaths() : null;
  
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
  
  // Return original endpoint for non-Netlify environments
  return endpoint;
}