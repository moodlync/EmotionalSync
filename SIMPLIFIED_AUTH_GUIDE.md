# MoodLync Simplified Authentication Guide

This guide explains how to use the simplified authentication system that we've integrated into the main MoodLync application.

## Overview

The simplified authentication system provides a streamlined alternative to the full authentication system. It focuses on core functionality (registration, login, logout) without the complexity of email verification, token rewards, and other features that might cause conflicts during development and testing.

## How to Use the Simplified Authentication

### Option 1: Use the Environment Variable

Set the `USE_SIMPLIFIED_AUTH` environment variable to `true` when starting the server:

```bash
USE_SIMPLIFIED_AUTH=true npm run dev
```

Or use the provided script:

```bash
./start-with-simplified-auth.sh
```

### Option 2: Modify server/routes.ts

You can also directly modify the `registerRoutes` function in `server/routes.ts` to always use the simplified auth:

```javascript
// Inside server/routes.ts
export async function registerRoutes(app: Express): Promise<Server> {
  // Set up simplified authentication first
  setupSimplifiedAuth(app);
  
  // Rest of the function...
}
```

## Test the Simplified Authentication

### Using the Automated Test Script

We've created a test script that verifies the simplified authentication system:

```bash
# Make the test script executable
chmod +x test-simplified-auth.sh

# Run the test
./test-simplified-auth.sh
```

The test script performs the following operations:
1. Verifies the server is running with the simplified auth
2. Registers a new test user
3. Logs in with the test user credentials
4. Retrieves and verifies the user profile
5. Logs out the user
6. Verifies the logout was successful

### Using the Web Interface

1. Start the server with simplified auth enabled
2. Open your browser and go to:
   - Main app: http://localhost:5000/ 
   - Auth test page: http://localhost:5000/simplified-auth-test.html

The simplified-auth-test.html page provides a user-friendly interface to:
- Register new users
- Login with existing credentials
- View and refresh your profile
- Logout

### Using the API Directly

Register a user:
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@example.com"}'
```

Login:
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' \
  -c cookies.txt
```

Get user profile:
```bash
curl -b cookies.txt http://localhost:5000/api/user
```

Logout:
```bash
curl -X POST -b cookies.txt http://localhost:5000/api/logout
```

## Differences from Regular Authentication

The simplified authentication:

1. **Uses in-memory storage**: All data is stored in memory and lost when the server restarts
2. **No email verification**: Users can register without email verification
3. **No token rewards**: The token economy system is bypassed
4. **Minimal user data**: Only essential user fields are stored
5. **Simplified sessions**: Session management is streamlined

## Files Related to Simplified Authentication

- `server/simplified-auth.ts`: Core authentication logic
- `server/simplified-storage.ts`: User data storage
- `server/simplified-logger.ts`: Logging utility for simplified auth
- `public/simplified-auth-test.html`: Test page for the auth flow
- `test-simplified-auth.js`: Automated test script
- `test-simplified-auth.sh`: Shell script to run the automated tests
- `start-with-simplified-auth.sh`: Script to start the server with simplified auth

## Technical Implementation

The simplified auth system is integrated alongside the regular system, allowing you to switch between them without modifying code:

- In `server/routes.ts`: Added conditional logic to choose auth system
- In `server/storage.ts`: Added compatibility layer to support both storage systems

## Default Test User

A default test user is created automatically:

- Username: `test`
- Password: `password123`
- Email: `test@example.com`

You can use this account to login immediately after starting the server.

## Troubleshooting

1. **Auth fails with "req.isAuthenticated is not a function"**: This happens when the authentication middleware isn't initialized before the routes. Make sure you're using the simplified auth.

2. **Session expires immediately**: Check that the session store is working correctly. The simplified auth uses a memory store that clears on server restart.

3. **Error with missing fields**: The simplified user object has fewer fields than the full user object. If you see errors about missing fields, you might need to add stub implementations in `simplified-storage.ts`.