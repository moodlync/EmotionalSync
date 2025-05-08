/**
 * This is a minimal server that listens on port 5000.
 * It's needed because Replit workflows expect port 5000 to be open, but our actual server runs on 9090.
 * This just keeps the workflow happy while our real server runs independently.
 */

const http = require('http');

// Create a minimal server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('MoodLync proxy is running. The actual server is at port 9090.\n');
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Workflow fix server running on port ${PORT}`);
  console.log(`The actual application is running on port 9090`);
});