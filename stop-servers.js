/**
 * Server process termination script for MoodLync
 * This script safely stops any running server processes
 */

const { exec } = require('child_process');

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Find and kill processes by port
function killProcessByPort(port) {
  return new Promise((resolve, reject) => {
    // Different commands for different platforms
    const command = process.platform === 'win32' 
      ? `FOR /F "tokens=5" %P IN ('netstat -a -n -o ^| findstr :${port}') DO TaskKill /PID %P /F`
      : `lsof -i :${port} | grep LISTEN | awk '{print $2}' | xargs -r kill -9`;
    
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // Ignore errors since they may just mean no process was found
        log(`No process found on port ${port} or failed to kill: ${err.message}`);
        resolve(false);
      } else {
        log(`Successfully terminated process on port ${port}`);
        resolve(true);
      }
    });
  });
}

// Find and kill processes by name
function killProcessByName(name) {
  return new Promise((resolve, reject) => {
    const command = process.platform === 'win32'
      ? `taskkill /F /IM "${name}" /T`
      : `pkill -f "${name}"`;
    
    exec(command, (err, stdout, stderr) => {
      if (err) {
        // Ignore errors since they may just mean no process was found
        log(`No process found matching "${name}" or failed to kill: ${err.message}`);
        resolve(false);
      } else {
        log(`Successfully terminated process matching "${name}"`);
        resolve(true);
      }
    });
  });
}

async function main() {
  log('Stopping all server processes...');
  
  // Kill processes by port
  const ports = [3000, 5000, 5173];
  for (const port of ports) {
    await killProcessByPort(port);
  }
  
  // Kill processes by name pattern
  const processNames = [
    'node.*forwarder',
    'node.*start-combined',
    'npm run dev',
    'tsx server/index'
  ];
  
  for (const name of processNames) {
    await killProcessByName(name);
  }
  
  log('All server processes terminated.');
}

// Execute if run directly
if (require.main === module) {
  main().catch(err => {
    log(`Error stopping servers: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { killProcessByPort, killProcessByName, main };