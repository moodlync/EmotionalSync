# MoodLync Port Forwarding Guide

This document explains how the port forwarding system works in MoodLync and how to manage it.

## Overview

MoodLync's port forwarding system allows the application, which runs on port 5000, to be accessed from the web through Replit's environment. This system is essential for making the application accessible externally.

## How It Works

1. The MoodLync server runs on port 5000 internally
2. A port forwarder is set up to:
   - Listen on port 3000 (Replit's default webview port)
   - Forward all incoming requests to http://localhost:5000
   - Include proper headers and error handling

## Implementation Details

- The port forwarding logic is implemented in `server/port-forward.ts`
- The forwarder is automatically started by the server when running in the Replit environment
- It configures proper CORS headers and error handling for all forwarded requests
- WebSocket connections are also properly proxied for real-time features

## Testing Port Forwarding

You can test if the port forwarding is working correctly by:

1. Running `node test-port-forward.js` which will:
   - Check accessibility of the test endpoint (/test)
   - Check the API health endpoint (/api/health)
   - Check the main application endpoint (/)

2. Accessing the `/test` endpoint in your browser, which will show a visual confirmation page

## Debugging Port Forwarding Issues

If you encounter issues with port forwarding:

1. Check the server logs for messages with the `[PortForward]` prefix
2. Verify the PORT environment variable is set correctly in the Replit environment
3. Ensure there are no other processes using the required ports
4. Restart the Replit instance if issues persist

## Environment Information

The port forwarder logs important environment information when it starts:

- PORT environment variable (if set)
- REPL_ID - Unique identifier for the Replit workspace
- REPL_SLUG - The URL-friendly name of the Replit workspace
- REPL_OWNER - The owner of the Replit workspace

## Port Configuration

- In the Replit environment, the port forwarder listens on port 3000
- This is necessary because Replit's webview expects applications to be accessible on port 3000
- The application itself continues to run on port 5000 internally

## Security Considerations

The port forwarder adds appropriate security headers:
- Access-Control-Allow-Origin
- Access-Control-Allow-Methods
- Access-Control-Allow-Headers
