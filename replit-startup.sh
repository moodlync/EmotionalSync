#!/bin/bash
# MoodLync Replit Startup Script
# This script ensures proper startup in the Replit environment

# Display MoodLync startup banner
echo "====================================="
echo "       Starting MoodLync             "
echo "  Replit Environment Configuration   "
echo "====================================="

# Start port forwarding for Replit webview access
echo "Starting webview bridge..."
./stop-webview-bridge.sh > /dev/null 2>&1
./start-webview-bridge.sh

# Start the main application
echo "Starting MoodLync application..."
npm run dev