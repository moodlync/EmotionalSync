# MoodLync Architecture

## Overview

MoodLync is an emotion-driven social networking platform designed to create authentic human connections based on shared emotional experiences. The application features a token-based economy system, premium subscription features, NFT capabilities, gamification elements, and supports web and mobile deployments.

The system is built using a modern full-stack JavaScript/TypeScript architecture with React on the frontend and Node.js on the backend. It implements a PostgreSQL database with Drizzle ORM for data persistence and includes Capacitor for cross-platform mobile app support.

## System Architecture

MoodLync follows a client-server architecture with clear separation between frontend (client) and backend (server) components:

```
├── client/             # Frontend React application
├── server/             # Backend Node.js Express server
├── shared/             # Shared code and schema definitions
├── capacitor.config.ts # Mobile app configuration
```

### Client-Server Communication

- **Primary API:** RESTful API endpoints for most data operations
- **Real-time Communication:** WebSocket for real-time features like chat and emotional status updates
- **Authentication:** Session-based authentication with JWT support

### Frontend Architecture

The frontend is built using React with TypeScript, following a component-based architecture. It employs:

- **State Management:** React Query for server state, React Context for application state
- **Styling:** Tailwind CSS with a custom design system based on shadcn/ui components
- **Routing:** wouter for lightweight client-side routing
- **Form Handling:** React Hook Form with Zod validation

### Backend Architecture

The backend is built using Node.js with Express, following a modular architecture:

- **API Layer:** Express routes organized by feature
- **Service Layer:** Business logic separated into service modules
- **Data Access Layer:** Drizzle ORM for database interactions
- **Authentication:** Passport.js with local strategy and support for OAuth providers

## Key Components

### Authentication System

Authentication is handled using Passport.js with a local strategy implementation that uses scrypt for password hashing. The system stores sessions in the database and includes support for:

- Local username/password authentication
- OAuth providers (Google, Facebook, Apple)
- Two-factor authentication
- Security features like recovery keys and backup codes

### Database Schema

MoodLync uses a PostgreSQL database with a comprehensive schema defined using Drizzle ORM. Key entities include:

- Users and profiles
- Emotional data and journal entries
- Token economy (rewards, redemptions)
- Premium features and subscriptions
- NFTs and digital collectibles
- Gamification elements (challenges, badges)
- Social connections and interactions

### Token Economy System

The application features a sophisticated token economy that includes:

- Token earning through various platform activities
- Token redemption for real-world value
- Token-based access to premium features
- NFT minting and burning mechanisms
- Token pool for community redistribution

### Premium Features

MoodLync offers premium subscription features including:

- Verified profile badges
- Private chat rooms
- Advertisement space
- Family plan access
- Customizable mood backgrounds
- Token milestone rewards
- Social sharing capabilities
- Emotional NFTs and collectibles

### Mobile App Support

The application is designed to work across platforms using Capacitor, with specific configurations for:

- iOS and Android native builds
- Push notifications
- Splash screens and app icons
- Offline capabilities via service workers

## Data Flow

### Authentication Flow

1. User registers or logs in via the auth page
2. Credentials are validated by the server
3. On successful authentication, a session is created
4. Session ID is stored in a cookie
5. Authenticated API requests include the session cookie

### User Emotion Tracking Flow

1. User selects their current emotion through the UI
2. Emotion data is sent to the server via API
3. Server stores the emotion data and calculates any token rewards
4. Updated user data and token balance are returned to the client
5. UI updates to reflect the new emotional state and rewards

### Token Earning and Redemption Flow

1. Users earn tokens through various activities (journal entries, emotion updates, etc.)
2. Token balances are stored in the database and displayed in the UI
3. Users can redeem tokens for various benefits through the redemption center
4. Redemption requests are processed by the server and appropriate rewards are distributed

### Premium Feature Access Flow

1. User subscribes to premium features via the premium page
2. Subscription status is updated in the database
3. Premium feature access is checked for each protected feature request
4. Premium-only UI elements are conditionally rendered based on subscription status

## External Dependencies

### API Integrations

- **Anthropic AI**: For AI companion conversation capabilities
- **SendGrid**: For email notifications and communications
- **Stripe**: For payment processing
- **NeonDB**: For serverless PostgreSQL database

### Third-Party Services

- **Push Notifications**: Capacitor Push Notifications plugin
- **Mobile Authentication**: Native device authentication
- **Data Encryption**: Server-side AES-256 encryption for sensitive data

## Deployment Strategy

The application is configured for deployment on Replit with specific settings for development and production environments:

### Development Environment

- Vite dev server for hot module reloading
- WebSocket server for real-time communication
- Local database connection

### Production Environment

- Built static assets served by the Express server
- Production database connection
- Optimized bundle sizes

### Mobile Deployment

- Capacitor configuration for building native iOS and Android apps
- App Store and Google Play distribution support
- Live reload capabilities for development

### Continuous Integration

- Automated builds triggered by code changes
- Replit-specific deployment configurations
- Environment-specific settings for development and production

## Security Considerations

The application implements several security measures:

- Password hashing using scrypt with salt
- Encrypted storage of sensitive user data
- Session-based authentication
- HTTPS enforcement in production
- Input validation with Zod
- Protection against common web vulnerabilities

## Scalability Considerations

The architecture supports scaling through:

- Stateless server design
- Database connection pooling
- Optimized queries with indexes
- Separation of concerns for horizontal scaling
- Caching strategies for frequently accessed data