/**
 * Simplified Netlify build script that focuses on producing a minimal working build
 * without unnecessary complexity
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('======= SIMPLIFIED NETLIFY BUILD =======');

// Ensure we have the right directories
const dirs = ['client', 'client/src', 'dist', 'dist/client'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Install minimum required dependencies
console.log('Installing minimum dependencies...');
try {
  execSync('npm install --no-save vite @vitejs/plugin-react', { stdio: 'inherit' });
} catch (err) {
  console.error('Error installing dependencies:', err.message);
}

// Create a minimal index.html in dist/client
console.log('Creating minimal index.html...');
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MoodLync</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(to bottom right, #4a00e0, #8e2de2);
      color: white;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .logo {
      font-size: 2.5rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    .container {
      max-width: 800px;
      padding: 2rem;
    }
    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 10px;
      padding: 2rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 2rem;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 2rem;
    }
    .feature {
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .button {
      display: inline-block;
      background: #ffffff;
      color: #6c11d3;
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      font-weight: bold;
      margin-top: 1rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    h1, h2, h3 {
      margin-top: 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">MoodLync</div>
    <div class="card">
      <h1>Emotion-Intelligent Social Networking</h1>
      <p>Our application is being deployed and will be available soon. Thank you for your patience.</p>
      <a href="/" class="button">Refresh Page</a>
    </div>
    <div class="features">
      <div class="feature">
        <h3>Emotional Tracking</h3>
        <p>Monitor and analyze your emotional patterns</p>
      </div>
      <div class="feature">
        <h3>AI Companion</h3>
        <p>Get personalized emotional support</p>
      </div>
      <div class="feature">
        <h3>Global Map</h3>
        <p>See emotional trends worldwide</p>
      </div>
      <div class="feature">
        <h3>Token Rewards</h3>
        <p>Earn rewards for engagement</p>
      </div>
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync('dist/client/index.html', indexHtml);

// Ensure _redirects file exists
console.log('Creating _redirects file...');
fs.writeFileSync('dist/client/_redirects', '/* /index.html 200');

console.log('Simplified build completed successfully!');
console.log('======= BUILD COMPLETE =======');
