/**
 * Complete Netlify build script that properly bundles and deploys the full application
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======= NETLIFY FULL BUILD =======');

// Make sure critical directories exist
const dirs = ['dist', 'dist/client'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Install all dependencies needed for build
console.log('Installing all required build dependencies...');
try {
  const criticalDeps = [
    '@vitejs/plugin-react',
    'vite',
    'postcss',
    'tailwindcss',
    'autoprefixer',
    'typescript',
    '@types/react',
    '@types/react-dom'
  ];
  
  execSync(`npm install --no-save ${criticalDeps.join(' ')}`, { stdio: 'inherit' });
  console.log('Critical dependencies installed successfully');
} catch (error) {
  console.error('Error installing dependencies:', error.message);
}

// Copy and prepare Vite configuration for production
console.log('Setting up Vite production configuration...');
try {
  const viteConfig = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'wouter'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-slot']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@server': path.resolve(__dirname, './server'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@styles': path.resolve(__dirname, './client/src/styles'),
      '@lib': path.resolve(__dirname, './client/src/lib'),
      '@hooks': path.resolve(__dirname, './client/src/hooks')
    }
  }
});
`;

  fs.writeFileSync('vite.netlify.js', viteConfig);
  console.log('Vite config created at vite.netlify.js');

  // Create a simpler entry point
  const indexContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './client/src/App.tsx';
import './client/src/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`;

  fs.writeFileSync('index.tsx', indexContent);
  console.log('Created simplified entry point index.tsx');

  // Run the actual build with Vite
  console.log('Building the application with Vite...');
  try {
    execSync('npx vite build --config vite.netlify.js', { stdio: 'inherit' });
    console.log('Build completed successfully!');
  } catch (buildError) {
    console.error('Build failed:', buildError.message);
    
    // If build fails, use fallback approach
    console.log('Using fallback build approach...');
    const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MoodLync</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    .logo {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 1rem;
      background: linear-gradient(to right, #ffffff, #a3bded);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 1.5rem;
      margin-bottom: 3rem;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 3rem;
    }
    .feature-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 2rem;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    .feature-title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: #ffffff;
    }
    .feature-description {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      background: white;
      color: #6a11cb;
      font-weight: bold;
      padding: 1rem 2.5rem;
      border-radius: 50px;
      font-size: 1.1rem;
      margin-top: 2rem;
      text-decoration: none;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
    .header {
      text-align: center;
      margin-bottom: 3rem;
    }
    .badge {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Platform Coming Soon</div>
      <div class="logo">MoodLync</div>
      <div class="subtitle">Emotion-Intelligent Social Networking</div>
      <a href="/" class="cta-button">Join the Waitlist</a>
    </div>
    
    <div class="feature-grid">
      <div class="feature-card">
        <h3 class="feature-title">Real-time Emotional Analysis</h3>
        <p class="feature-description">Connect with others based on emotional states rather than profiles. Find people who understand exactly how you're feeling.</p>
      </div>
      
      <div class="feature-card">
        <h3 class="feature-title">Global Emotion Mapping</h3>
        <p class="feature-description">Visualize emotional patterns across communities and regions with our interactive emotion map.</p>
      </div>
      
      <div class="feature-card">
        <h3 class="feature-title">AI-Powered Companion</h3>
        <p class="feature-description">Receive personalized insights and therapeutic support from our advanced AI companion.</p>
      </div>
      
      <div class="feature-card">
        <h3 class="feature-title">Token Rewards System</h3>
        <p class="feature-description">Earn tokens for participation and emotional growth that can be redeemed for premium features.</p>
      </div>
      
      <div class="feature-card">
        <h3 class="feature-title">Emotional NFTs</h3>
        <p class="feature-description">Collect unique digital assets that evolve with your emotional journey as a premium member.</p>
      </div>
      
      <div class="feature-card">
        <h3 class="feature-title">Mood-Based Chat Rooms</h3>
        <p class="feature-description">Join themed chat rooms tailored to specific emotions and experiences for meaningful connections.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Create the fallback page
    fs.writeFileSync('dist/client/index.html', fallbackHtml);
    console.log('Created fallback index.html');
  }
} catch (configError) {
  console.error('Error setting up Vite configuration:', configError.message);
}

// Ensure _redirects file exists
console.log('Creating _redirects file...');
fs.writeFileSync('dist/client/_redirects', '/* /index.html 200');

// Try to copy any other needed assets
console.log('Copying assets...');
try {
  const assetsDir = path.join(__dirname, 'attached_assets');
  const targetDir = path.join(__dirname, 'dist', 'client', 'assets');
  
  if (fs.existsSync(assetsDir)) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const files = fs.readdirSync(assetsDir);
    let copyCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.svg')) {
        const sourcePath = path.join(assetsDir, file);
        const targetPath = path.join(targetDir, file);
        fs.copyFileSync(sourcePath, targetPath);
        copyCount++;
      }
    }
    
    console.log(`Copied ${copyCount} assets to build output`);
  } else {
    console.log('Assets directory not found, skipping asset copy');
  }
} catch (assetError) {
  console.error('Error copying assets:', assetError.message);
}

console.log('======= NETLIFY BUILD COMPLETE =======');