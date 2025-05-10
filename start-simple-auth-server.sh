#!/bin/bash

# Start the simplified authentication server
echo "Starting MoodLync simplified authentication server..."
NODE_ENV=development tsx server/simple-index.ts