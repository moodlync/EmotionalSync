#!/bin/bash

# Start the main application with simplified authentication on port 5001
echo "Starting MoodLync with simplified authentication on port 5001..."
USE_SIMPLIFIED_AUTH=true PORT=5001 NODE_ENV=development tsx server/index.ts