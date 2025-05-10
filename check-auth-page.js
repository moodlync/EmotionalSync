// Simple script to verify our auth page changes
import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log('Starting auth page check...');
    
    // Launch the browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    // Open a new page
    const page = await browser.newPage();
    
    // Navigate to the auth page
    console.log('Navigating to auth page...');
    await page.goto('http://localhost:5000/auth', {
      waitUntil: 'networkidle2',
      timeout: 15000
    });
    
    // Capture a screenshot
    console.log('Taking screenshot...');
    await page.screenshot({ path: 'auth-page-screenshot.png' });
    
    // Check for header element (which should be removed)
    const headerExists = await page.evaluate(() => {
      // Look for the old header gradient which should be gone
      const header = document.querySelector('.bg-gradient-to-r.from-\\[\\#D7D7FC\\].via-\\[\\#4D4DE3\\].to-\\[\\#1A1A2E\\].absolute.top-0');
      return !!header;
    });
    
    console.log('Header element exists:', headerExists);
    console.log('Header should be removed:', !headerExists ? 'SUCCESS' : 'FAILED');
    
    // Check for logo element
    const logoExists = await page.evaluate(() => {
      const logo = document.querySelector('svg#moodlync-logo') || document.querySelector('[id*="logo"]');
      return !!logo;
    });
    
    console.log('Logo element exists:', logoExists);
    
    // Check for hero image
    const imageExists = await page.evaluate(() => {
      const image = document.querySelector('img[alt="MoodLync Connection"]');
      return !!image;
    });
    
    console.log('Hero image exists:', imageExists);
    
    // Check if image is using object-contain
    const imageUsesObjectContain = await page.evaluate(() => {
      const image = document.querySelector('img[alt="MoodLync Connection"]');
      if (!image) return false;
      
      const styles = window.getComputedStyle(image);
      return styles.objectFit === 'contain';
    });
    
    console.log('Image uses object-contain:', imageUsesObjectContain);
    
    // Close the browser
    await browser.close();
    
    console.log('Auth page check completed. Screenshot saved as auth-page-screenshot.png');
  } catch (error) {
    console.error('Error checking auth page:', error);
  }
})();