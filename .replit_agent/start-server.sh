#!/bin/bash
# This script starts both the main application server and the Replit proxy server

# Start the replit proxy server in the background
node replit-proxy.js &
PROXY_PID=$!

# Start the main application server
NODE_ENV=development tsx server/index.ts

# When the main server exits, also kill the proxy
kill $PROXY_PID