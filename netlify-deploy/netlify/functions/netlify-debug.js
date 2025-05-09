/**
 * Netlify Debug Function
 * 
 * This function provides diagnostic information about the Netlify environment
 * to help troubleshoot deployment issues.
 */
export async function handler(event, context) {
  try {
    // Get information about the Netlify environment
    const netlifyInfo = {
      site_name: process.env.SITE_NAME || 'Not available',
      netlify_dev: process.env.NETLIFY_DEV || 'Not set',
      context: process.env.CONTEXT || 'Not available',
      deploy_url: process.env.DEPLOY_URL || 'Not available',
      deploy_prime_url: process.env.DEPLOY_PRIME_URL || 'Not available',
      url: process.env.URL || 'Not available',
      node_version: process.version,
      build_id: process.env.BUILD_ID || 'Not available',
      cache_dir: process.env.NETLIFY_CACHE_DIR || 'Not available',
      function_dir: process.env.NETLIFY_FUNCTION_DIR || 'Not available',
      api_available: process.env.NETLIFY_FUNCTIONS_API_SECRET ? 'Yes' : 'No',
      public_directory: process.env.PUBLISH_DIR || 'Not available',
      build_directory: process.env.BUILD_DIR || 'Not available',
      repository_url: process.env.REPOSITORY_URL || 'Not available',
      branch: process.env.BRANCH || 'Not available',
      head: process.env.HEAD || 'Not available',
      commit_ref: process.env.COMMIT_REF || 'Not available',
      incoming_hook_title: process.env.INCOMING_HOOK_TITLE || 'Not available',
      incoming_hook_url: process.env.INCOMING_HOOK_URL || 'Not available',
      incoming_hook_body: process.env.INCOMING_HOOK_BODY || 'Not available',
    };

    // Check file system access
    let fileSystemInfo = 'Error checking file system';
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const functionDir = process.env.NETLIFY_FUNCTION_DIR || '.';
      const files = fs.readdirSync(functionDir);
      
      fileSystemInfo = `Files in function directory: ${files.join(', ')}`;
      
      // Check if index.html exists in the publish directory
      const publishDir = process.env.PUBLISH_DIR || '../../dist/public';
      let publishDirContents = 'Unable to read publish directory';
      
      try {
        publishDirContents = fs.readdirSync(publishDir).join(', ');
      } catch (err) {
        publishDirContents = `Error reading publish directory: ${err.message}`;
      }
      
      fileSystemInfo += `\nPublish directory contents: ${publishDirContents}`;
      
      // Check if index.html exists
      let indexHtmlExists = 'Unknown';
      try {
        indexHtmlExists = fs.existsSync(path.join(publishDir, 'index.html')) ? 'Yes' : 'No';
      } catch (err) {
        indexHtmlExists = `Error checking: ${err.message}`;
      }
      
      fileSystemInfo += `\nindex.html exists: ${indexHtmlExists}`;
    } catch (err) {
      fileSystemInfo = `Error checking file system: ${err.message}`;
    }

    // Format as HTML response
    const htmlResponse = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Netlify Deployment Diagnostics</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          h1 {
            color: #0e1e25;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 10px;
          }
          .section {
            margin-bottom: 30px;
            background: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
          }
          h2 {
            color: #2d3748;
            margin-top: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f2f2f2;
          }
          pre {
            background: #f1f1f1;
            padding: 10px;
            overflow-x: auto;
            border-radius: 4px;
          }
          .success {
            color: green;
          }
          .error {
            color: red;
          }
        </style>
      </head>
      <body>
        <h1>MoodLync Netlify Deployment Diagnostics</h1>
        
        <div class="section">
          <h2>Netlify Environment</h2>
          <table>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
            ${Object.entries(netlifyInfo).map(([key, value]) => `
              <tr>
                <td>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                <td>${value}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        
        <div class="section">
          <h2>File System Check</h2>
          <pre>${fileSystemInfo}</pre>
        </div>
        
        <div class="section">
          <h2>Request Information</h2>
          <table>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
            <tr>
              <td>HTTP Method</td>
              <td>${event.httpMethod}</td>
            </tr>
            <tr>
              <td>Path</td>
              <td>${event.path}</td>
            </tr>
            <tr>
              <td>Headers</td>
              <td><pre>${JSON.stringify(event.headers, null, 2)}</pre></td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Troubleshooting Tips</h2>
          <ol>
            <li>Ensure your <code>netlify.toml</code> has the correct <code>publish</code> directory path: <code>dist/public</code></li>
            <li>Verify that client-side routing redirects are properly set up in <code>netlify.toml</code></li>
            <li>Check that your build command is correctly generating the static files</li>
            <li>Make sure all required environment variables are set in the Netlify dashboard</li>
            <li>Verify that your API endpoint redirects are configured correctly</li>
          </ol>
        </div>
        
        <footer style="margin-top: 40px; text-align: center; color: #666; font-size: 0.8em;">
          MoodLync Netlify Diagnostics • Generated on ${new Date().toLocaleString()}
        </footer>
      </body>
      </html>
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html'
      },
      body: htmlResponse
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html'
      },
      body: `<!DOCTYPE html>
      <html>
        <head>
          <title>Netlify Diagnostics Error</title>
        </head>
        <body>
          <h1>Error Running Diagnostics</h1>
          <p>There was an error running the diagnostics: ${error.message}</p>
          <pre>${error.stack}</pre>
        </body>
      </html>`
    };
  }
}