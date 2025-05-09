#!/usr/bin/env node

/**
 * Netlify Pre-Build Setup Script
 * 
 * This script performs tasks specifically for the Netlify build environment
 * to ensure proper configuration before the build process starts.
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}===== MoodLync Netlify Pre-Build Setup =====${colors.reset}`);

// Ensure auth and welcome pages are set to light mode
const forceAuthLightMode = () => {
  const authPagePath = path.join('client', 'src', 'pages', 'auth-page.tsx');
  const welcomePagePath = path.join('client', 'src', 'pages', 'welcome-page.tsx');
  
  try {
    // Check if the auth page exists
    if (fs.existsSync(authPagePath)) {
      console.log(`${colors.blue}Checking auth page theme settings...${colors.reset}`);
      
      let authPageContent = fs.readFileSync(authPagePath, 'utf8');
      
      // Check if the dark mode theme is referenced in the main div
      if (authPageContent.includes('dark:bg-gray-950')) {
        console.log(`${colors.yellow}Found dark mode references in auth page, removing...${colors.reset}`);
        
        // Replace dark mode class in main div
        authPageContent = authPageContent.replace(
          /className="min-h-screen flex flex-col md:flex-row bg-\[#EAEAEA\] dark:bg-gray-950"/g,
          'className="min-h-screen flex flex-col md:flex-row bg-[#EAEAEA]"'
        );
        
        // Add theme enforcement code if it doesn't exist
        if (!authPageContent.includes('Force light mode in auth page')) {
          console.log(`${colors.yellow}Adding light mode enforcement to auth page...${colors.reset}`);
          
          const themeEnforcementCode = `  // Force light mode in auth page
  useEffect(() => {
    // Save previous theme for restoration when navigating away
    const prevTheme = localStorage.getItem('theme');
    localStorage.setItem('prev-theme', prevTheme || 'light');
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
    
    return () => {
      // Restore previous theme when component unmounts
      const savedTheme = localStorage.getItem('prev-theme');
      if (savedTheme) {
        localStorage.setItem('theme', savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    };
  }, []);
  
`;
          // Insert the theme enforcement code before the return statement
          authPageContent = authPageContent.replace(
            /return \(/g, 
            `${themeEnforcementCode}return (`
          );
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(authPagePath, authPageContent);
        console.log(`${colors.green}Successfully updated auth page to enforce light mode${colors.reset}`);
      } else {
        console.log(`${colors.green}Auth page appears to be correctly configured for light mode${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}Auth page not found at expected path: ${authPagePath}${colors.reset}`);
    }
    
    // Check if the welcome page exists
    if (fs.existsSync(welcomePagePath)) {
      console.log(`${colors.blue}Checking welcome page theme settings...${colors.reset}`);
      
      let welcomePageContent = fs.readFileSync(welcomePagePath, 'utf8');
      
      // Check if the dark mode theme is referenced in the main div
      if (welcomePageContent.includes('dark:bg-gray-950')) {
        console.log(`${colors.yellow}Found dark mode references in welcome page, removing...${colors.reset}`);
        
        // Replace dark mode class in main div
        welcomePageContent = welcomePageContent.replace(
          /className="min-h-screen flex flex-col welcome-page bg-\[#EAEAEA\] dark:bg-gray-950"/g,
          'className="min-h-screen flex flex-col welcome-page bg-[#EAEAEA]"'
        );
        
        // Add theme enforcement code if it doesn't exist
        if (!welcomePageContent.includes('Force light mode in welcome page')) {
          console.log(`${colors.yellow}Adding light mode enforcement to welcome page...${colors.reset}`);
          
          const themeEnforcementCode = `  // Force light mode in welcome page
  useEffect(() => {
    // Save previous theme for restoration when navigating away
    const prevTheme = localStorage.getItem('theme');
    localStorage.setItem('prev-theme', prevTheme || 'light');
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
    
    return () => {
      // Restore previous theme when component unmounts
      const savedTheme = localStorage.getItem('prev-theme');
      if (savedTheme) {
        localStorage.setItem('theme', savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }
    };
  }, []);
  
`;
          // Insert the theme enforcement code before the return statement
          welcomePageContent = welcomePageContent.replace(
            /return \(/g, 
            `${themeEnforcementCode}return (`
          );
        }
        
        // Also update the header to remove dark mode references
        if (welcomePageContent.includes('bg-white dark:bg-gray-900')) {
          welcomePageContent = welcomePageContent.replace(
            /header className="w-full bg-white dark:bg-gray-900 border-b dark:border-gray-800 py-5 px-6 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white\/90 dark:bg-gray-900\/90"/g,
            'header className="w-full bg-white border-b py-5 px-6 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/90"'
          );
        }
        
        // Write the updated content back to the file
        fs.writeFileSync(welcomePagePath, welcomePageContent);
        console.log(`${colors.green}Successfully updated welcome page to enforce light mode${colors.reset}`);
      } else {
        console.log(`${colors.green}Welcome page appears to be correctly configured for light mode${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}Welcome page not found at expected path: ${welcomePagePath}${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error updating theme settings: ${error.message}${colors.reset}`);
  }
};

// Execute setup tasks
try {
  console.log(`${colors.blue}Setting up Netlify build environment...${colors.reset}`);
  
  // Force light mode for auth and welcome pages
  forceAuthLightMode();
  
  console.log(`\n${colors.green}✅ Netlify pre-build setup completed successfully${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error during Netlify pre-build setup: ${error.message}${colors.reset}`);
  process.exit(1);
}

console.log(`${colors.cyan}===== End of MoodLync Netlify Pre-Build Setup =====${colors.reset}`);