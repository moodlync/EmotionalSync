/**
 * Netlify Build Fix for MoodLync
 * This script specifically addresses issues with the Netlify build process
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Running MoodLync Netlify build fix script...');

// Make sure dist/public exists
const publicDir = path.join(__dirname, 'dist', 'public');
if (!fs.existsSync(publicDir)) {
  console.log('📁 Creating dist/public directory...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple mood-hub.html file in the dist/public directory
console.log('📝 Creating mood-hub.html file...');
const moodHubPath = path.join(publicDir, 'mood-hub');
const moodHubHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MoodLync - Mood Hub</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(90deg, #4D4DE3 0%, #F64B88 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .card {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .button {
      display: inline-block;
      background-color: #4D4DE3;
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <h1>MoodLync Mood Hub</h1>
  <p>Track, analyze and connect through your emotional journey</p>
  
  <div class="card">
    <h2>Mood Tracking Center</h2>
    <p>Record your emotions and their intensity to gain insights into your emotional patterns.</p>
    <a href="/" class="button">Go to Home</a>
  </div>
  
  <footer>
    <p>&copy; 2024 MoodLync. All rights reserved.</p>
  </footer>
</body>
</html>`;

fs.writeFileSync(moodHubPath, moodHubHtml);

// Also create mood-hub.html (with extension) for broader compatibility
fs.writeFileSync(`${moodHubPath}.html`, moodHubHtml);

// Ensure direct-mood-selector.html has proper folder structure
const directMoodSelectorPath = path.join(publicDir, 'direct-mood-selector.html');
if (fs.existsSync(directMoodSelectorPath)) {
  console.log('✅ direct-mood-selector.html already exists');
} else {
  console.log('📝 Copying direct-mood-selector.html from client/public...');
  const sourcePath = path.join(__dirname, 'client', 'public', 'direct-mood-selector.html');
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, directMoodSelectorPath);
  } else {
    console.log('⚠️ Source direct-mood-selector.html not found, creating placeholder...');
    fs.writeFileSync(directMoodSelectorPath, `<!DOCTYPE html>
<html>
<head>
  <title>MoodLync - Direct Mood Selector</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { text-align: center; font-family: system-ui, sans-serif; max-width: 600px; margin: 20px auto; }
  </style>
</head>
<body>
  <h1>MoodLync Direct Mood Selector</h1>
  <p>Select your current mood to track and connect with others.</p>
  <p><a href="/">Back to Home</a> • <a href="/mood-hub">Mood Hub</a></p>
</body>
</html>`);
  }
}

// Create assets/js directory and mood-shared.js
const assetsJsDir = path.join(publicDir, 'assets', 'js');
fs.mkdirSync(assetsJsDir, { recursive: true });
const moodSharedJsPath = path.join(assetsJsDir, 'mood-shared.js');

console.log('📝 Creating mood-shared.js...');
fs.writeFileSync(moodSharedJsPath, `/**
 * MoodLync Shared Mood Functions
 * Provides shared functionality for all mood-related interfaces
 */

const MoodLyncShared = {
  // Primary emotions that users can select
  PRIMARY_EMOTIONS: ['Joy', 'Sadness', 'Anger', 'Anxiety', 'Excitement', 'Neutral'],
  
  // Emotion details
  EMOTIONS: {
    'Joy': {
      name: 'Happy',
      emoji: '😊',
      description: 'You feel positive and content',
      message: 'Happiness is contagious! Share your joy with others.',
      intensity: 7
    },
    'Sadness': {
      name: 'Sad',
      emoji: '😢',
      description: 'You feel down or melancholic',
      message: 'It\'s okay to feel sad sometimes. Reach out if you need support.',
      intensity: 6
    },
    'Anger': {
      name: 'Angry',
      emoji: '😠',
      description: 'You feel upset or irritated',
      message: 'Take a deep breath. Consider what\'s triggering this feeling.',
      intensity: 8
    },
    'Anxiety': {
      name: 'Anxious',
      emoji: '😰',
      description: 'You feel worried or nervous',
      message: 'Try some mindful breathing to help calm your thoughts.',
      intensity: 7
    },
    'Excitement': {
      name: 'Excited',
      emoji: '🤩',
      description: 'You feel enthusiastic or thrilled',
      message: 'Channel this energy into something creative or productive!',
      intensity: 9
    },
    'Neutral': {
      name: 'Neutral',
      emoji: '😐',
      description: 'You feel balanced or indifferent',
      message: 'A calm emotional state is a good base for mindfulness.',
      intensity: 5
    }
  },
  
  // Utility functions
  getEmotionByName: function(name) {
    return this.EMOTIONS[name] || this.EMOTIONS.Neutral;
  },
  
  getIntensityDescription: function(intensity) {
    if (intensity <= 3) return 'mild';
    if (intensity <= 6) return 'moderate';
    if (intensity <= 9) return 'strong';
    return 'intense';
  }
};

// Make available in global scope
if (typeof window !== 'undefined') {
  window.MoodLyncShared = MoodLyncShared;
}

// Make available for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MoodLyncShared;
}`);

console.log('✅ Netlify build fix script completed successfully!');