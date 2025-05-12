#!/bin/bash

# Start the static server for MoodLync
echo "Starting MoodLync Static Server..."

# Kill any existing instances of the static server
pkill -f "node static-server.js" || true
sleep 1

# Start the static server in the background
node static-server.js > static-server.log 2>&1 &
STATIC_PID=$!
echo $STATIC_PID > static-server.pid
echo "Static server started with PID: $STATIC_PID"
echo "Log file: static-server.log"