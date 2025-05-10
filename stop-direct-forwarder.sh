#!/bin/bash

# Stop the direct port forwarder
echo "Stopping MoodLync direct port forwarder..."

if [ -f direct-forwarder.pid ]; then
  PID=$(cat direct-forwarder.pid)
  echo "Found forwarder process with PID: $PID"
  
  # Check if process is running
  if ps -p $PID > /dev/null; then
    echo "Stopping process..."
    kill $PID
    echo "Process stopped."
  else
    echo "Process is not running."
  fi
  
  # Remove PID file
  rm direct-forwarder.pid
else
  echo "No PID file found. Trying to find and kill process..."
  pkill -f "node.*replit-direct-forwarder.js" || true
fi

echo "Done!"