#!/bin/bash

# Start the webview bridge to ensure Replit can access our application
echo "Starting MoodLync Webview Bridge..."

# Kill any existing bridge processes
echo "Stopping any existing webview bridge processes..."
pkill -f "node.*replit-webview-bridge.js" || true
pkill -f "node.*replit-forwarder.js" || true
pkill -f "node.*simple-port-forwarder.js" || true
sleep 1

# Start the bridge in the background
echo "Starting new webview bridge..."
node replit-webview-bridge.js > webview-bridge.log 2>&1 &

# Store the PID
WB_PID=$!
echo $WB_PID > webview-bridge.pid
echo "Webview bridge started with PID: $WB_PID"
echo "Log file: webview-bridge.log"

# Check if the bridge is running
sleep 2
if ps -p $WB_PID > /dev/null; then
  echo "✅ Webview bridge started successfully"
  echo "You can now view your application in the Replit webview"
else
  echo "❌ Failed to start webview bridge"
  echo "Check webview-bridge.log for errors"
fi