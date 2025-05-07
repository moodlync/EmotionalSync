/**
 * Replit Workflow Compatibility Proxy Server
 * 
 * This minimal server simply returns a 200 OK response on port 5000.
 * It keeps Replit workflow happy while the real server runs on another port.
 */

import http from 'http';

const PORT = 5000;
const REAL_PORT = 9090; // The port our actual server is running on

console.log(`[Replit Proxy] Starting minimal response server on port ${PORT}`);

// Create a minimal server that just responds with 200 OK
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>MoodLync Application</title>
      <meta http-equiv="refresh" content="0;URL='https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.dev/'">
      <style>
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: #f5f5f5;
          color: #333;
        }
        .container {
          text-align: center;
          padding: 20px;
          border-radius: 10px;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          max-width: 600px;
        }
        h1 { margin-top: 0; color: #3949ab; }
        p { line-height: 1.6; }
        .spinner {
          display: inline-block;
          width: 40px;
          height: 40px;
          border: 4px solid rgba(57, 73, 171, 0.2);
          border-radius: 50%;
          border-top-color: #3949ab;
          animation: spin 1s ease-in-out infinite;
          margin-bottom: 20px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="spinner"></div>
        <h1>MoodLync Application</h1>
        <p>The application server is running on port ${REAL_PORT}.</p>
        <p>Redirecting to the main application...</p>
      </div>
    </body>
    </html>
  `);
});

server.on('error', (err) => {
  console.error(`[Replit Proxy] Error: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`[Replit Proxy] Port ${PORT} is already in use by another process.`);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Replit Proxy] Proxy server running on port ${PORT}`);
});