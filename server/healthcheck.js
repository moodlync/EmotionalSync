// MoodLync Health Check Module
// This provides diagnostic endpoints for verifying server functionality

export function setupHealthCheck(app) {
  // Basic health endpoint for simple ping/pong
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      service: 'MoodLync API',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Enhanced health endpoint with more system information
  app.get('/api/health', (req, res) => {
    const memory = process.memoryUsage();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: {
        node: process.version,
        env: process.env.NODE_ENV || 'development',
        platform: process.platform,
        arch: process.arch
      },
      memory: {
        rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memory.external / 1024 / 1024)} MB`,
      },
      service: 'MoodLync API',
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Diagnostic test endpoint
  app.get('/test', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MoodLync - Server Test</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #6366F1, #4F46E5);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            background: rgba(0,0,0,0.2);
            border-radius: 16px;
            padding: 30px;
            text-align: center;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .success {
            background: rgba(16, 185, 129, 0.2);
            color: #ecfdf5;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            text-align: left;
          }
          .info {
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            text-align: left;
          }
          .logo {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1rem;
          }
          .logo span:first-child {
            color: white;
          }
          .logo span:last-child {
            color: #FEC89A;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo"><span>MOOD</span><span>LYNC</span></div>
          <h1>Server Test Successful</h1>
          <div class="success">
            <p>✅ The MoodLync server is running properly!</p>
            <p>✅ This page was served from port ${req.socket.localPort}</p>
          </div>
          <div class="info">
            <p><strong>Server Information:</strong></p>
            <p>Time: ${new Date().toISOString()}</p>
            <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
            <p>Node Version: ${process.version}</p>
          </div>
          <p>The MoodLync application is running correctly.</p>
        </div>
      </body>
      </html>
    `);
  });
  
  return app;
}