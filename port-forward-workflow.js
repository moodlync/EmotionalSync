import { exec } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting port forwarder...');

// Start the port forwarder in background mode
const child = exec('node simple-port-forwarder.mjs', {
  cwd: __dirname
});

child.stdout.on('data', (data) => {
  console.log(`Port forwarder: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`Port forwarder error: ${data}`);
});

// Keep the process alive
process.stdin.resume();

console.log('Port forwarder started in background mode. Press Ctrl+C to stop.');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping port forwarder...');
  child.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Stopping port forwarder...');
  child.kill();
  process.exit(0);
});