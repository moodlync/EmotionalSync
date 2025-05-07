/**
 * This utility helps remove Replit-specific metadata attributes from React 
 * components when deploying to other environments like Netlify.
 */

export function removeReplitMetadata() {
  // Only run this in production builds
  if (process.env.NODE_ENV === 'production') {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', () => {
      // Find all elements with data-replit-metadata attribute
      const elementsWithMetadata = document.querySelectorAll('[data-replit-metadata]');
      
      // Remove the attribute from each element
      elementsWithMetadata.forEach(el => {
        el.removeAttribute('data-replit-metadata');
      });
      
      console.log('Removed Replit metadata attributes for production environment');
    });
  }
}