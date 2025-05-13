#!/bin/bash
# Netlify build script for MoodLync

echo "🚀 Starting MoodLync Netlify build..."

# Run the standard build
npm run build

# Create the client directory structure for Netlify
echo "📁 Creating dist/client directory..."
mkdir -p dist/client

# Copy the built assets to the Netlify publish directory
echo "📦 Copying built files to dist/client..."
cp -r dist/public/* dist/client/

# Create a basic 404.html page
echo "📝 Creating 404.html page..."
cat > dist/client/404.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MoodLync - Page Not Found</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      text-align: center;
      color: #333;
    }
    h1 {
      font-size: 2.5rem;
      background: linear-gradient(90deg, #4D4DE3 0%, #F64B88 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .card {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      padding: 30px;
      margin: 20px 0;
    }
    .button {
      display: inline-block;
      background-color: #4D4DE3;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>Page Not Found</h1>
  
  <div class="card">
    <h2>Oops! We couldn't find that page.</h2>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" class="button">Go to Home Page</a>
  </div>
  
  <footer>
    <p>&copy; 2025 MoodLync. All rights reserved.</p>
  </footer>
</body>
</html>
EOL

echo "✅ MoodLync Netlify build completed successfully!"