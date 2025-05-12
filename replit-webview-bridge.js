import http from 'http';
import { log } from './server/vite';

const WEBVIEW_PORT = 8080;
const APP_PORT = 5000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const options = {
    hostname: 'localhost',
    port: APP_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.writeHead(502);
    res.end('Application server unavailable');
  });

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

server.listen(WEBVIEW_PORT, '0.0.0.0', () => {
  log(`Webview bridge running on port ${WEBVIEW_PORT}`);
  log(`Forwarding to application on port ${APP_PORT}`);
});