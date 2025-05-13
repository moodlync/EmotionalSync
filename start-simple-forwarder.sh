#!/bin/bash

# Start the simple port forwarder for MoodLync
echo "Starting simple port forwarder for MoodLync..."

# Check if forwarder is already running
if [ -f "simple-forwarder.pid" ]; then
  PID=$(cat simple-forwarder.pid)
  if ps -p $PID > /dev/null; then
    echo "Forwarder is already running with PID: $PID"
    exit 0
  else
    echo "PID file exists but process is not running. Removing stale PID file."
    rm simple-forwarder.pid
  fi
fi

# Start the forwarder in the background
node simple-replit-forwarder.js > simple-forwarder.log 2>&1 &

# Wait for the forwarder to start
sleep 2

# Check if the forwarder started successfully
if [ -f "simple-forwarder.pid" ]; then
  PID=$(cat simple-forwarder.pid)
  if ps -p $PID > /dev/null; then
    echo "Forwarder started successfully with PID: $PID"
    echo "Now forwarding port 3000 to 5000"
    exit 0
  fi
fi

echo "Failed to start forwarder. Check simple-forwarder.log for details."
exit 1