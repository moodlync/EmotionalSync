#!/bin/bash

# Start the direct port forwarder for Replit
echo "Starting MoodLync direct port forwarder..."

# Kill any existing processes on port 3000
echo "Checking for existing processes on port 3000..."
pkill -f "node.*replit-direct-forwarder.js" || true

# Start the forwarder in the background
echo "Starting the direct forwarder..."
node replit-direct-forwarder.js > direct-forwarder.log 2>&1 &

# Store the PID
echo $! > direct-forwarder.pid
echo "Direct forwarder started with PID: $(cat direct-forwarder.pid)"

echo "Done! The direct forwarder is now running."