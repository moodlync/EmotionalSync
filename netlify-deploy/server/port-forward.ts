import http, { ServerResponse, IncomingMessage } from 'http';
import httpProxy from 'http-proxy';
import { Socket } from 'net';

// Configuration
const TARGET_PORT = 5000;

// For Replit specifically:
// - We must always listen on port 3000, which is the port Replit expects for its webview
// - This port will be proxied externally by Replit
const PUBLIC_PORT = 3000;
const PORT_NUMBER = PUBLIC_PORT;

// Custom error interface for proxy errors
interface ProxyError extends Error {
  code?: string;
}

// Log info with timestamp
function log(message: string) {
  console.log(`[${new Date().toISOString()}] [PortForward] ${message}`);
}

// Set up the proxy server
log(`Creating proxy server targeting port ${TARGET_PORT}...`);

const proxy = httpProxy.createProxyServer({
  target: `http://localhost:${TARGET_PORT}`,
  ws: true,
  changeOrigin: true
});

// Handle proxy errors
proxy.on('error', (err: ProxyError, req: IncomingMessage, res: ServerResponse | Socket) => {
  log(`Proxy error: ${err.message}`);
  
  // Only handle HTTP response errors, not socket errors
  if (res instanceof ServerResponse && !res.headersSent) {
    try {
      res.writeHead(502, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({ 
        error: 'Proxy Error', 
        message: 'The application server is temporarily unavailable.',
        code: err.code || 'UNKNOWN'
      }));
    } catch (responseError) {
      log(`Error sending error response: ${responseError}`);
    }
  }
});

// Create server
const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Log the request unless it's a frequent one like health checks
  if (!req.url?.includes('/health') && !req.url?.includes('/favicon.ico')) {
    log(`${req.method} ${req.url}`);
  }
  
  // Forward the request
  proxy.web(req, res);
});

// Handle WebSocket connections
server.on('upgrade', (req, socket, head) => {
  log(`WebSocket upgrade: ${req.url}`);
  proxy.ws(req, socket, head);
});

// Export a function to start the port forwarder
export function startPortForwarder() {
  server.listen(PORT_NUMBER, '0.0.0.0', () => {
    log(`✅ Port forwarder running on port ${PORT_NUMBER}`);
    log(`✅ Forwarding requests to http://localhost:${TARGET_PORT}`);
  });
  
  return server;
}

// In ES modules, we don't have direct access to require.main === module
// so we'll remove this check and let the function be called from index.ts