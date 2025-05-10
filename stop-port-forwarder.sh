#!/bin/bash

# Check if PID file exists
if [ -f "port-forwarder.pid" ]; then
  PF_PID=$(cat port-forwarder.pid)
  
  echo "Stopping port forwarder with PID: $PF_PID..."
  
  # Kill the process
  kill $PF_PID 2>/dev/null || true
  
  # Remove the PID file
  rm port-forwarder.pid
  
  echo "Port forwarder stopped successfully."
else
  echo "No port forwarder PID file found."
  
  # Try to find and kill any port forwarder processes
  pkill -f "node replit-port-forwarder.mjs" || true
  
  echo "Attempted to stop any running port forwarder processes."
fi