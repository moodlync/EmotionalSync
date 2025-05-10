# MoodLync Simplified Authentication System

This is a streamlined version of the authentication system that focuses on core functionality without the complexity of the full system.

## How to Use

### Starting the Server

You can start the simplified authentication server using:

```bash
./start-simple-auth-server.sh
```

The server will run on port 5000.

### Testing the Authentication Flow

1. Open your browser and navigate to: http://localhost:5000/simplified-auth-test.html
2. This page allows you to:
   - Register a new user
   - Login with existing credentials
   - View your user profile
   - Logout
   - Check the server health

### Running Automated Tests

You can run automated tests of the authentication system with:

```bash
node test-simple-auth.js
```

## Technical Details

The simplified authentication system:

1. Uses an in-memory store for user data
2. Implements secure password hashing with scrypt
3. Uses session-based authentication
4. Provides basic WebSocket capabilities
5. Includes proper error handling and logging

## API Endpoints

- `POST /api/register` - Create a new user account
- `POST /api/login` - Authenticate a user
- `GET /api/user` - Get the current user's profile (protected route)
- `POST /api/logout` - End the user's session
- `GET /api/healthcheck` - Check server health

## Implementation Files

- `server/simplified-auth.ts` - Authentication logic
- `server/simplified-storage.ts` - User data storage
- `server/simple-routes.ts` - API routes
- `server/simple-index.ts` - Express server setup

## Adding to package.json

To add a script for the simplified auth server to your package.json, add the following to the "scripts" section:

```json
"simple-auth": "NODE_ENV=development tsx server/simple-index.ts"
```

Then you can start it with:

```bash
npm run simple-auth
```