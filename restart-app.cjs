/**
 * MoodLync Restart Script
 * 
 * This script finds and stops any running MoodLync processes
 * and then restarts the application using the combined-starter.
 */

const { exec, spawn } = require('child_process');

console.log('🔄 MoodLync Restart Script');

// Try to find and kill any running MoodLync processes
console.log('Looking for running MoodLync processes...');

exec('ps aux | grep "node\\|npm" | grep -v grep', (error, stdout, stderr) => {
  if (error) {
    console.log('No running processes found or error checking processes.');
    startApp();
    return;
  }
  
  console.log('Found running processes:');
  console.log(stdout);
  
  // Extract PIDs from process list
  const lines = stdout.split('\n');
  const pids = [];
  
  for (const line of lines) {
    if (!line) continue;
    
    const parts = line.trim().split(/\s+/);
    if (parts.length > 1) {
      const pid = parts[1];
      const cmd = line.toLowerCase();
      
      // Only kill npm/node processes that appear to be related to our app
      if (
        (cmd.includes('npm run dev') || 
         cmd.includes('node server') ||
         cmd.includes('simple-port') ||
         cmd.includes('port-helper') ||
         cmd.includes('combined-starter')) &&
        !cmd.includes('restart-app')
      ) {
        pids.push(pid);
      }
    }
  }
  
  if (pids.length === 0) {
    console.log('No MoodLync processes found.');
    startApp();
    return;
  }
  
  console.log(`Found ${pids.length} processes to stop: ${pids.join(', ')}`);
  
  // Kill each process
  let killedCount = 0;
  for (const pid of pids) {
    exec(`kill ${pid}`, (killError) => {
      if (killError) {
        console.error(`Failed to kill process ${pid}: ${killError.message}`);
      } else {
        console.log(`Stopped process ${pid}`);
        killedCount++;
      }
      
      // If all processes have been processed, start the app
      if (killedCount === pids.length) {
        console.log('All processes stopped.');
        
        // Wait a moment to ensure ports are released
        setTimeout(startApp, 2000);
      }
    });
  }
});

function startApp() {
  console.log('🚀 Starting MoodLync application...');
  
  // Start the combined-starter script
  const app = spawn('node', ['combined-starter.cjs'], {
    stdio: 'inherit',
    detached: true
  });
  
  app.on('error', (err) => {
    console.error(`Failed to start application: ${err.message}`);
    process.exit(1);
  });
  
  // Detach the process so it continues running when this script exits
  app.unref();
  
  console.log('✅ Application startup triggered.');
  console.log('✅ Exiting restart script.');
  process.exit(0);
}