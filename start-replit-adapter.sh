#!/bin/bash

# Start the Replit port adapter in the background
echo "Starting Replit port adapter..."
node replit-port-adapter.js > replit-adapter.log 2>&1 &

# Store the PID for later use
echo $! > replit-adapter.pid
echo "Replit port adapter started with PID: $!"
echo "You can check logs in replit-adapter.log"