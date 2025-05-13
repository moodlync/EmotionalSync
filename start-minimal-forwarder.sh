#!/bin/bash

# Start the minimal port forwarder
echo "Starting minimal port forwarder..."

# Kill any existing processes
pkill -f "node.*forwarder" || true

# Start the forwarder in the background
nohup node minimal-forwarder.cjs > minimal-forwarder.log 2>&1 &

# Save the process ID
echo $! > minimal-forwarder.pid
echo "Forwarder started with PID: $(cat minimal-forwarder.pid)"

# Wait a moment for it to start
sleep 2

# Test if it's running
if ps -p $(cat minimal-forwarder.pid) > /dev/null; then
  echo "Forwarder is running successfully."
else
  echo "Failed to start forwarder. Check minimal-forwarder.log for details."
  exit 1
fi