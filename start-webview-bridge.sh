#!/bin/bash
# Start the MoodLync Webview Bridge to connect Replit webview to our application

# Kill any existing processes
if [ -f webview-bridge.pid ]; then
  pid=$(cat webview-bridge.pid)
  if ps -p $pid > /dev/null; then
    echo "Stopping existing webview bridge (PID: $pid)..."
    kill $pid
    sleep 1
  fi
  rm webview-bridge.pid
fi

# Start new instance
echo "Starting MoodLync Webview Bridge..."
node replit-webview-bridge.js > webview-bridge.log 2>&1 &

# Wait for startup and check
sleep 2
if [ -f webview-bridge.pid ]; then
  pid=$(cat webview-bridge.pid)
  if ps -p $pid > /dev/null; then
    echo "✅ Webview Bridge started successfully (PID: $pid)"
    echo "✅ Bridging connections from Replit webview to port 5000"
    exit 0
  fi
fi

echo "⚠️ Warning: Bridge may not have started correctly"
echo "Check webview-bridge.log for details"

# Try fallback on port 3000
echo "Attempting to start on fallback port 3000..."
PORT=3000 node replit-webview-bridge.js > webview-bridge-fallback.log 2>&1 &
echo "Fallback started. Check webview-bridge-fallback.log for details"