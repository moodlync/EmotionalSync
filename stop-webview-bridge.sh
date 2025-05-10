#!/bin/bash
# Stop the MoodLync Webview Bridge

if [ -f webview-bridge.pid ]; then
  pid=$(cat webview-bridge.pid)
  if ps -p $pid > /dev/null; then
    echo "Stopping webview bridge (PID: $pid)..."
    kill $pid
    sleep 1
    if ps -p $pid > /dev/null; then
      echo "Force stopping webview bridge..."
      kill -9 $pid
    fi
    echo "✅ Webview bridge stopped"
  else
    echo "No running webview bridge found with PID: $pid"
  fi
  rm webview-bridge.pid
else
  echo "No webview bridge PID file found"
  
  # Attempt to find and kill by process name
  bridge_pids=$(ps aux | grep "replit-webview-bridge.js" | grep -v grep | awk '{print $2}')
  if [ -n "$bridge_pids" ]; then
    echo "Found running bridge processes: $bridge_pids"
    for pid in $bridge_pids; do
      echo "Stopping process $pid..."
      kill $pid
    done
    echo "✅ All bridge processes stopped"
  else
    echo "No running webview bridge processes found"
  fi
fi