/**
 * Replit Workflow Compatibility Proxy Server
 * 
 * This minimal server simply returns a 200 OK response on port 5000.
 * It keeps Replit workflow happy while the real server runs on another port.
 */

const express = require('express');
const app = express();

app.get('*', (req, res) => {
  res.status(200).send(`MoodLync proxy server is running on port 5000. 
The actual application server is running on port 9090.
Please access the application at: ${req.protocol}://${req.hostname}:9090`);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});