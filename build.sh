#!/bin/bash
export PATH="./node_modules/.bin:$PATH"
export NODE_ENV=production
echo "Running build with Vite directly..."
./node_modules/.bin/vite build
