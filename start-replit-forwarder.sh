#!/bin/bash

# Ensure we capture errors
set -e

# Stop any existing forwarder
if [ -f replit-forwarder.pid ]; then
  echo "Stopping existing forwarder..."
  ./stop-replit-forwarder.sh
fi

# Create log file
LOG_FILE="replit-forwarder.log"
touch $LOG_FILE
echo "[$(date)] Starting Replit forwarder..." >> $LOG_FILE

# Start the Replit forwarder and redirect output to log file
echo "Starting Replit forwarder..."
node replit-forwarder.js >> $LOG_FILE 2>&1 &

# Store the process ID
FORWARDER_PID=$!
echo $FORWARDER_PID > replit-forwarder.pid

echo "Replit forwarder started (PID: $FORWARDER_PID)"
echo "Forwarder PID saved to replit-forwarder.pid"
echo "Logs available in $LOG_FILE"

# Wait a moment to see if process dies immediately
sleep 2
if ! ps -p $FORWARDER_PID > /dev/null; then
  echo "ERROR: Forwarder stopped immediately. Check $LOG_FILE for details"
  echo "Last 10 lines of log:"
  tail -10 $LOG_FILE
  exit 1
fi

echo "Forwarder running successfully"