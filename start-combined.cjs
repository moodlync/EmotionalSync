
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MoodLync Server');

// Start the development server
const app = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

app.on('error', (err) => {
  console.error(`Failed to start application: ${err.message}`);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  app.kill('SIGINT');
  process.exit(0);
});
