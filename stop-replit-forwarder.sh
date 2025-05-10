#!/bin/bash

# Check if PID file exists
if [ -f replit-forwarder.pid ]; then
  PID=$(cat replit-forwarder.pid)
  
  # Check if the process is running
  if ps -p $PID > /dev/null; then
    echo "Stopping Replit forwarder (PID: $PID)..."
    kill $PID
    
    # Wait for the process to terminate
    sleep 1
    if ps -p $PID > /dev/null; then
      echo "Process didn't terminate gracefully, forcing..."
      kill -9 $PID
    fi
    
    echo "Replit forwarder stopped"
  else
    echo "No running forwarder found with PID: $PID"
  fi
  
  # Remove the PID file
  rm replit-forwarder.pid
else
  echo "No PID file found. Replit forwarder may not be running."
fi