module.exports = {
  plugins: {
    autoprefixer: {
      // Explicitly updating the browserslist data during build
      overrideBrowserslist: require('browserslist').loadConfig({
        path: __dirname,
        env: process.env.NODE_ENV
      }) || ['defaults'],
    },
    tailwindcss: {},
  },
};

// Attempt to update browserslist data immediately
try {
  console.log('Updating browserslist database from postcss.config.js...');
  require('child_process').execSync('npx update-browserslist-db@latest', {
    stdio: 'inherit'
  });
  console.log('Browserslist database updated successfully from postcss.config.js');
} catch (error) {
  console.warn('Failed to update browserslist database from postcss.config.js:', error.message);
}
