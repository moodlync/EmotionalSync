#!/bin/bash

# Simple test script for MoodLync simplified authentication
# This script runs the test-simplified-auth.js script against the running server

echo "Testing MoodLync simplified authentication system..."

# Check if the right node modules are installed
if [ ! -f node_modules/node-fetch/package.json ]; then
  echo "Installing required dependencies..."
  npm install node-fetch
fi

# Check if the server is running on port 5001
if ! curl -s http://localhost:5001/api/healthcheck > /dev/null; then
  echo "Error: Server doesn't appear to be running on port 5001."
  echo "Please start the server with simplified auth using:"
  echo "./start-with-simplified-auth.sh"
  exit 1
fi

# Set the test URL
export TEST_URL=http://localhost:5001

# Run the test script
echo "Running tests against $TEST_URL..."
node test-simplified-auth.js

# Exit with the test script's status code
exit $?