#!/bin/bash

# Start the Replit forwarder
echo "Starting Replit forwarder..."

# Kill any existing forwarder processes
pkill -f "node.*forwarder" || true

# Start the forwarder in the background
nohup node replit-simple-forwarder.js > replit-forwarder.log 2>&1 &

# Save the process ID
echo $! > replit-forwarder.pid

echo "Forwarder started with PID: $(cat replit-forwarder.pid)"

# Wait a moment for it to start
sleep 2

# Test if it's running
if ps -p $(cat replit-forwarder.pid) > /dev/null; then
  echo "Forwarder is running successfully."
else
  echo "Failed to start forwarder. Check replit-forwarder.log for details."
  exit 1
fi