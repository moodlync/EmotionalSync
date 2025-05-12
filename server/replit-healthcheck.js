// MoodLync Replit Healthcheck
// This file provides special endpoints for Replit to verify server health

export function setupReplitHealthcheck(app) {
  // Special endpoint for Replit's health check system
  app.get('/__replit_health', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: 'replit',
      service: 'MoodLync'
    });
  });
  
  // Special root handler for Replit webview
  app.get('/replit-root', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MoodLync on Replit</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #6366F1, #4F46E5);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          .container {
            max-width: 600px;
            background: rgba(0,0,0,0.2);
            border-radius: 16px;
            padding: 30px;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .logo {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
          }
          .logo span:first-child {
            color: white;
          }
          .logo span:last-child {
            color: #FEC89A;
          }
          .btn {
            display: inline-block;
            background: white;
            color: #4F46E5;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
            transition: all 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo"><span>MOOD</span><span>LYNC</span></div>
          <h1>Welcome to MoodLync</h1>
          <p>MoodLync is running successfully in the Replit environment!</p>
          <p>The emotion-intelligent social platform that provides personalized, adaptive digital interactions.</p>
          <a href="/" class="btn">Go to MoodLync App</a>
        </div>
      </body>
      </html>
    `);
  });
  
  return app;
}