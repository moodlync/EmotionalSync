#!/bin/bash

# Check if the PID file exists
if [ -f "replit-adapter.pid" ]; then
  # Read the PID from the file
  PID=$(cat replit-adapter.pid)
  
  # Check if the process is still running
  if ps -p $PID > /dev/null; then
    echo "Stopping Replit port adapter (PID: $PID)..."
    kill $PID
    echo "Replit port adapter stopped."
  else
    echo "Replit port adapter is not running."
  fi
  
  # Remove the PID file
  rm replit-adapter.pid
else
  echo "No PID file found. Replit port adapter may not be running."
fi