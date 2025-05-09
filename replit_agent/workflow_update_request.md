
# Workflow Update Request
# This file is read by the Replit agent to update workflow configuration

## Instructions
Please update the "Start application" workflow to use the command:
```
node start-with-port-helper.cjs
```

## Reason
Using this script ensures that:
1. The application runs on port 5001
2. A helper server runs on port 5000 for Replit workflow detection
3. The Replit preview will show the application correctly
