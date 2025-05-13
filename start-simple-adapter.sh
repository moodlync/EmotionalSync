#!/bin/bash

# Start the simplified Replit port adapter in the background
echo "Starting simplified Replit port adapter..."
node simple-replit-adapter.cjs > simple-adapter.log 2>&1 &

# Store the PID for later use
echo $! > simple-adapter.pid
echo "Simplified Replit port adapter started with PID: $!"
echo "You can check logs in simple-adapter.log"