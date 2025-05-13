const http = require('http');

http.createServer((req, res) => {
  console.log(`Forwarding: ${req.method} ${req.url}`);
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: req.url,
    method: req.method,
    headers: req.headers
  };
  
  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  
  proxyReq.on('error', (err) => {
    console.error(`Proxy error: ${err.message}`);
    res.writeHead(502);
    res.end(`Proxy error: ${err.message}`);
  });
  
  req.pipe(proxyReq);
}).listen(3000, '0.0.0.0', () => {
  console.log('Minimal forwarder running at http://0.0.0.0:3000');
  console.log('Forwarding requests to http://localhost:5000');
});