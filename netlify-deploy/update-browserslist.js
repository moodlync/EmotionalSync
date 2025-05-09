const { execSync } = require('child_process');

try {
  console.log('Updating browserslist database...');
  execSync('npx update-browserslist-db@latest', { stdio: 'inherit' });
  console.log('Browserslist database updated successfully.');
} catch (error) {
  console.error('Failed to update browserslist database:', error.message);
  // Continue anyway, don't fail the build
  console.log('Continuing with build regardless of browserslist update status.');
}
