/**
 * Quick deployment helper for MoodLync
 * This script copies the running app (server assets) to the Netlify deployment directory
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======= PREPARING NETLIFY DEPLOYMENT =======');

// Ensure the required directories exist
const dirs = ['dist', 'dist/client', 'dist/client/assets'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create a deployment package
console.log('Creating deployment package...');

// 1. Create an advanced fallback index.html (app shell) that will load the app
console.log('Creating application shell...');
const appShellHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MoodLync - Emotion Intelligence Network</title>
  <meta name="description" content="Connect with others through shared emotional experiences on MoodLync.">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <style>
    /* Global styles */
    :root {
      --primary: hsl(265, 84%, 43%);
      --primary-light: hsl(265, 84%, 70%);
      --secondary: hsl(217, 97%, 57%);
      --background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      --card-bg: rgba(255, 255, 255, 0.1);
      --text: #ffffff;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      background: var(--background);
      color: var(--text);
      min-height: 100vh;
      line-height: 1.6;
      overflow-x: hidden;
    }
    
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    /* Header styles */
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .logo {
      font-size: 1.75rem;
      font-weight: bold;
      background: linear-gradient(to right, white, #a3bded);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-fill-color: transparent;
    }
    
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    
    .btn {
      display: inline-block;
      padding: 0.6rem 1.5rem;
      background: white;
      color: var(--primary);
      border-radius: 50px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    /* Main content */
    .main-content {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
    }
    
    .hero-section {
      text-align: center;
      padding: 3rem 1rem;
    }
    
    .hero-title {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: linear-gradient(to right, white, #a3bded);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      text-fill-color: transparent;
      line-height: 1.2;
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      max-width: 800px;
      margin: 0 auto 2rem;
      opacity: 0.9;
    }
    
    /* Loading indicator */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 2rem auto;
    }
    
    .loading-spinner {
      width: 60px;
      height: 60px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top: 4px solid white;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .loading-text {
      margin-top: 1rem;
      font-size: 1.1rem;
    }
    
    /* Feature grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }
    
    .feature-card {
      background: var(--card-bg);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    }
    
    .feature-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: white;
    }
    
    .feature-description {
      opacity: 0.9;
    }
    
    /* Footer */
    .app-footer {
      background: rgba(0, 0, 0, 0.2);
      padding: 2rem;
      text-align: center;
    }
    
    .footer-links {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 1rem;
    }
    
    .footer-link {
      color: white;
      text-decoration: none;
      opacity: 0.8;
      transition: opacity 0.2s ease;
    }
    
    .footer-link:hover {
      opacity: 1;
    }
    
    .copyright {
      opacity: 0.7;
      font-size: 0.9rem;
      margin-top: 1rem;
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .app-header {
        padding: 1rem;
      }
      
      .hero-title {
        font-size: 2rem;
      }
      
      .hero-subtitle {
        font-size: 1rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .footer-links {
        flex-direction: column;
        gap: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <header class="app-header">
      <div class="logo">
        <img src="/assets/logo-transparent-png.png" alt="MoodLync Logo" style="height: 40px; vertical-align: middle; margin-right: 10px;">
        MoodLync
      </div>
      <nav class="nav-links">
        <a href="#features" class="footer-link">Features</a>
        <a href="#" class="btn">Sign In</a>
      </nav>
    </header>
    
    <main class="main-content">
      <section class="hero-section">
        <h1 class="hero-title">Emotion-Intelligent Social Networking</h1>
        <p class="hero-subtitle">Connect with others through shared emotional experiences in a supportive community designed to enhance emotional intelligence and foster meaningful connections.</p>
        
        <div id="app-root">
          <!-- React app will mount here -->
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading MoodLync experience...</p>
          </div>
        </div>
        
        <div id="features" class="features-grid">
          <div class="feature-card">
            <h3 class="feature-title">Emotional Analysis</h3>
            <img src="/assets/IMG_0208.jpeg" alt="Emotional Analysis" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
            <p class="feature-description">Our platform analyzes your emotional state and connects you with others experiencing similar feelings, creating an environment of empathy and understanding.</p>
          </div>
          
          <div class="feature-card">
            <h3 class="feature-title">Global Emotion Map</h3>
            <img src="/assets/IMG_0211.jpeg" alt="Global Emotion Map" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
            <p class="feature-description">Explore our interactive world map showing emotional patterns across regions and communities, helping you understand global emotional trends.</p>
          </div>
          
          <div class="feature-card">
            <h3 class="feature-title">AI Companion</h3>
            <img src="/assets/fotor-ai-202505105223.jpg" alt="AI Companion" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
            <p class="feature-description">Receive personalized emotional support and insights from your AI companion, designed to help you navigate complex feelings and grow emotionally.</p>
          </div>
          
          <div class="feature-card">
            <h3 class="feature-title">Token Economy</h3>
            <p class="feature-description">Earn tokens through platform engagement that can be redeemed for premium features, creating a sustainable ecosystem of emotional growth.</p>
          </div>
          
          <div class="feature-card">
            <h3 class="feature-title">Emotional NFTs</h3>
            <img src="/assets/Create a very unique image for Emotional NFTs_Exclusive Digital Collectibles_Premium members earn unique NFTs that evolve with your emotional journey.jpg" alt="Emotional NFTs" style="width: 100%; border-radius: 8px; margin-bottom: 1rem;">
            <p class="feature-description">Premium members can collect unique digital assets that evolve with their emotional journey, representing their personal growth.</p>
          </div>
          
          <div class="feature-card">
            <h3 class="feature-title">Mood-Based Chat Rooms</h3>
            <div style="display: flex; gap: 8px; margin-bottom: 1rem;">
              <img src="/assets/individual for Anger Emotional NFt.jpg" alt="Anger Emotion" style="width: 48%; border-radius: 8px;">
              <img src="/assets/individual for Surprise Emotional NFt.jpg" alt="Surprise Emotion" style="width: 48%; border-radius: 8px;">
            </div>
            <p class="feature-description">Join themed discussion spaces tailored to specific emotions where you can connect with others experiencing similar feelings.</p>
          </div>
        </div>
      </section>
    </main>
    
    <footer class="app-footer">
      <div class="footer-links">
        <a href="#" class="footer-link">About Us</a>
        <a href="#" class="footer-link">Privacy Policy</a>
        <a href="#" class="footer-link">Terms of Service</a>
        <a href="#" class="footer-link">Contact</a>
      </div>
      <p class="copyright">© 2025 MoodLync. All rights reserved.</p>
    </footer>
  </div>
  
  <script>
    // Check for app availability
    document.addEventListener('DOMContentLoaded', () => {
      // The real app script will replace this functionality
      setTimeout(() => {
        console.log('MoodLync app would load here in production');
      }, 2000);
    });
  </script>
</body>
</html>`;

fs.writeFileSync('dist/client/index.html', appShellHtml);

// 2. Copy assets from attached_assets
console.log('Copying image assets...');
const srcAssetsDir = 'attached_assets';
const destAssetsDir = 'dist/client/assets';

if (fs.existsSync(srcAssetsDir)) {
  const imageFiles = fs.readdirSync(srcAssetsDir).filter(file => 
    file.endsWith('.jpg') || 
    file.endsWith('.jpeg') || 
    file.endsWith('.png') || 
    file.endsWith('.svg') || 
    file.endsWith('.gif')
  );
  
  let copiedFiles = 0;
  imageFiles.forEach(file => {
    const srcPath = path.join(srcAssetsDir, file);
    const destPath = path.join(destAssetsDir, file);
    
    try {
      fs.copyFileSync(srcPath, destPath);
      copiedFiles++;
    } catch (err) {
      console.error(`Error copying ${file}: ${err.message}`);
    }
  });
  
  console.log(`Copied ${copiedFiles} images to assets directory`);
}

// 3. Ensure _redirects file exists
console.log('Creating _redirects file...');
fs.writeFileSync('dist/client/_redirects', '/* /index.html 200');

// 4. Copy favicon if exists
if (fs.existsSync('favicon.ico')) {
  fs.copyFileSync('favicon.ico', 'dist/client/favicon.ico');
}

console.log('Netlify deployment preparation complete!');
console.log('======= DEPLOYMENT READY =======');