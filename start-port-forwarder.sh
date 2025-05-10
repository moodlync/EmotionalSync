#!/bin/bash

# Start the persistent port forwarder
echo "Starting persistent port forwarder..."

# Kill any existing port forwarder processes
pkill -f "node replit-port-forwarder.mjs" || true

# Start the port forwarder in the background and redirect output to a log file
nohup node replit-port-forwarder.mjs > port-forwarder.log 2>&1 &

# Get the process ID
PF_PID=$!
echo $PF_PID > port-forwarder.pid

echo "Port forwarder started with PID: $PF_PID"
echo "Log file: port-forwarder.log"
echo ""
echo "Check the logs with: tail -f port-forwarder.log"
echo "Stop the port forwarder with: kill $(cat port-forwarder.pid)"