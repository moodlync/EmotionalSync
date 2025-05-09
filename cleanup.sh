#!/bin/bash

echo "Starting MoodLync cleanup script..."

# Port forwarding scripts
echo "Removing port forwarding scripts..."
rm -f port-bridge.js port-bridge.cjs
rm -f port-listener.js port-listener.cjs
rm -f port-signal.js port-signal.cjs
rm -f port-check.cjs port-fix.js port-helper.log
rm -f simple-port-helper.cjs simple-port-signal.cjs
rm -f replit-port-bridge.cjs replit-port-proxy.js

# Workflow helper scripts
echo "Removing workflow helper scripts..."
rm -f workflow-fix.js workflow-helper.cjs workflow-signal.js
rm -f replit-workflow-port.js

# Proxy server scripts
echo "Removing proxy server scripts..."
rm -f proxy-server.js simple-proxy.js
rm -f replit-proxy.js replit-proxy.cjs
rm -f replit-portmap.js replit-portmap.cjs
rm -f advanced-port-forwarder.cjs

# Multiple starter scripts
echo "Removing duplicate starter scripts..."
rm -f start-app.js start-app.cjs
rm -f start-with-proxy.js start-with-port-forward.js
rm -f start-with-port-helper.cjs start-with-port-listener.cjs
rm -f start-with-bridge.sh start-proxy.sh start-portmap.sh
rm -f combined-server.cjs combined-starter.cjs start-combined.cjs
rm -f restart-app.cjs moodlync-starter.cjs

# Keeping only the necessary Netlify files
echo "Cleaning up Netlify deployment files..."
rm -f moodsync-netlify-deploy.tar.gz

echo "Cleanup complete! The application should now run more smoothly."