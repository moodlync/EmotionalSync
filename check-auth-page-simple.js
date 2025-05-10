// Simple script to check auth page changes using fetch
import fetch from 'node-fetch';

(async () => {
  try {
    console.log('Checking auth page...');
    
    // Fetch the page HTML
    const response = await fetch('http://localhost:5000/auth');
    const html = await response.text();
    
    console.log('Successfully fetched auth page HTML');
    
    // Check for removed header
    const hasHeaderGradient = html.includes('bg-gradient-to-r from-[#D7D7FC] via-[#4D4DE3] to-[#1A1A2E] absolute top-0');
    console.log('Header gradient removed:', !hasHeaderGradient ? 'YES' : 'NO');
    
    // Check for logo size
    const hasLargerLogo = html.includes('logoSize={220}');
    console.log('Larger logo (220px):', hasLargerLogo ? 'YES' : 'NO');
    
    // Check for object-contain class on image
    const hasObjectContain = html.includes('object-contain');
    console.log('Using object-contain for images:', hasObjectContain ? 'YES' : 'NO');
    
    // Check for increased padding
    const hasIncreasedPadding = html.includes('p-4 md:p-6 pt-8');
    console.log('Increased padding:', hasIncreasedPadding ? 'YES' : 'NO');
    
    console.log('Auth page check completed');
  } catch (error) {
    console.error('Error checking auth page:', error);
  }
})();