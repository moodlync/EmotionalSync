#!/bin/bash

# MoodLync Application Launcher for Replit
# This script starts both the main application and port forwarder

echo "Starting MoodLync application system..."
echo "---------------------------------------"

# Start the port forwarder in the background
node simple-port-forwarder.js &
PORT_FORWARDER_PID=$!
echo "Port forwarder started with PID: $PORT_FORWARDER_PID"

# Start the main application
echo "Starting main application..."
npm run dev

# Clean up the port forwarder when the main app exits
kill $PORT_FORWARDER_PID