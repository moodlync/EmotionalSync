import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { StrictMode, useEffect } from "react";
import { removeReplitMetadata } from "./utils/metadata-fixer";

// Remove Replit metadata attributes when running in production (e.g., on Netlify)
removeReplitMetadata();

// Function to check for deep linking redirects from 404 page
function handleDeepLinking() {
  // Check URL parameters for redirect
  const urlParams = new URLSearchParams(window.location.search);
  const redirectPath = urlParams.get('redirect');
  
  if (redirectPath) {
    // Clean up the URL
    window.history.replaceState({}, document.title, redirectPath);
    return true;
  }
  
  // Check localStorage for saved path from 404.html
  const savedPath = localStorage.getItem('redirectPath');
  if (savedPath && savedPath !== '/' && window.location.pathname === '/') {
    // Clean up localStorage
    localStorage.removeItem('redirectPath');
    
    // Only redirect if we're on the homepage (to prevent infinite loops)
    window.history.replaceState({}, document.title, savedPath);
    return true;
  }
  
  return false;
}

// Handle deep linking before rendering the app
handleDeepLinking();

// Enhanced App wrapper to handle navigation
function AppWithDeepLinkHandling() {
  useEffect(() => {
    // For handling future deep links after app load
    const handleRouteChange = () => {
      // This will be useful for analytics or other route-change handling
      console.log('Route changed to:', window.location.pathname);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);
  
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppWithDeepLinkHandling />
  </StrictMode>
);
