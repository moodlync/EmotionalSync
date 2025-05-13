#!/bin/bash

# Start the direct port forwarder for Replit using CommonJS version
echo "Starting MoodLync direct port forwarder..."

# Kill any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
pkill -f "node.*replit-direct-forwarder.cjs" || true
pkill -f "node.*forwarder" || true

# Remove any old logs and PIDs
rm -f direct-forwarder.log direct-forwarder.pid

# Start the forwarder in the background with nohup to keep it running
echo "Starting the direct forwarder..."
nohup node replit-direct-forwarder.cjs > direct-forwarder.log 2>&1 &

# Store the PID
PID=$!
echo $PID > direct-forwarder.pid
echo "Direct forwarder started with PID: $PID"

# Wait a moment for the forwarder to start
sleep 2

# Check if process is still running
if ps -p $PID > /dev/null; then
  echo "Done! The direct forwarder is now running."
else
  echo "Error: Forwarder started but is no longer running. Check direct-forwarder.log for details."
  cat direct-forwarder.log
  exit 1
fi