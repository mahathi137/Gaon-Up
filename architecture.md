# Architecture Overview

## 1. Overview

GaonUp is a village development simulator application focused on sustainable rural development in India. The application follows a client-server architecture with a React frontend and an Express.js backend. It uses PostgreSQL for data storage with Drizzle ORM for database interactions. The application allows users to select villages, implement development projects across various sectors, and compete on a leaderboard based on their development scores.

## 2. System Architecture

The application follows a modern web architecture with the following key components:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │      │                 │
│  React Frontend │<────>│  Express Server │<────>│  PostgreSQL DB  │
│                 │      │                 │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

### 2.1 Frontend Architecture

The frontend is built with React using TypeScript and follows a component-based architecture. It leverages:

- React for UI rendering
- TanStack Query (React Query) for data fetching and state management
- Wouter for lightweight client-side routing
- ShadCN UI components for consistent design
- Tailwind CSS for styling
- Vite as the build tool and development server

The frontend is organized into:
- `/client/src/components` - Reusable UI components
- `/client/src/pages` - Page components that correspond to routes
- `/client/src/hooks` - Custom React hooks
- `/client/src/lib` - Utility functions and service abstractions

### 2.2 Backend Architecture

The backend is built with Express.js using TypeScript and follows a REST API architecture. Key components include:

- Express.js for HTTP request handling
- Passport.js for authentication
- Drizzle ORM for database operations
- Connect-pg-simple for session storage in PostgreSQL
- TypeScript for type safety

The backend is organized into:
- `/server` - Server implementation files
- `/shared` - Shared code between client and server (e.g., schema definitions)
- `/db` - Database connection and operations

### 2.3 Database Architecture

The application uses PostgreSQL with Drizzle ORM for data modeling and query building. The database schema is defined in `/shared/schema.ts` and includes tables for:

- Users
- Countries
- States
- Villages (inferred from code)
- Sectors (inferred from code)
- Scores (inferred from code)
- Session storage

## 3. Key Components

### 3.1 Authentication System

The application implements a username/password authentication system using:
- Passport.js for authentication middleware
- Crypto's scrypt function for password hashing
- Express session for maintaining user sessions
- PostgreSQL for session storage

### 3.2 Village Development Simulator

The core of the application is a simulation system allowing users to develop villages through:
- Village selection based on geographical region (country, state)
- Viewing village data through multiple visualization methods (3D, image, SVG)
- Mini-games for sector development (resource allocation, challenges, quizzes)
- Scoring based on development metrics

### 3.3 Data Visualization

The application offers multiple visualization methods for village data:
- 3D models using Sketchfab integration
- SVG-based village representations
- Image-based visualizations
- Simple data displays

### 3.4 Gamification Elements

The application includes several gamification features:
- Mini-games for different sectors (education, health, agriculture, etc.)
- Resource allocation challenges
- Knowledge quizzes
- Leaderboard for competitive progress tracking

## 4. Data Flow

### 4.1 User Authentication Flow

1. User registers or logs in via `/api/login` or through the registration form
2. Credentials are verified against database records
3. On successful authentication, a session is created
4. Session data is stored in PostgreSQL via connect-pg-simple
5. Frontend receives user data and updates UI accordingly

### 4.2 Village Development Flow

1. User selects a country, state, and village
2. Frontend fetches village data from the backend
3. User interacts with sector-specific mini-games and development tools
4. Development actions are sent to the backend
5. Backend processes actions, updates the database, and calculates scores
6. Updated data is returned to the frontend for display

### 4.3 Leaderboard Flow

1. Backend calculates and updates user scores based on development actions
2. Frontend fetches leaderboard data from `/api/scores`
3. Scores are displayed in a ranked leaderboard view

## 5. External Dependencies

### 5.1 Frontend Dependencies

- React ecosystem (React, React DOM, React Hook Form)
- TanStack Query for data fetching
- Wouter for routing
- Tailwind CSS for styling
- ShadCN UI (based on Radix UI) for component library
- DND Kit for drag-and-drop functionality
- Three.js for 3D rendering (partial implementation)
- Sketchfab Viewer API for 3D model display

### 5.2 Backend Dependencies

- Express.js for server functionality
- Passport.js for authentication
- Drizzle ORM for database interactions
- @neondatabase/serverless for database connectivity
- Zod for data validation
- Connect-pg-simple for session management

## 6. Deployment Strategy

The application is configured for deployment on Replit with the following strategies:

### 6.1 Development Environment

- Uses Vite's development server with hot module replacement
- Runs on port 5000 (configured in `.replit`)
- Database connection via environment variables

### 6.2 Production Build

- Client-side code built with Vite to `/dist/public`
- Server code bundled with esbuild to `/dist/index.js`
- Static assets served by Express

### 6.3 Database Migration

- Uses Drizzle Kit for schema migrations
- Database URL provided via environment variables
- Seeding script available for initial data setup

### 6.4 CI/CD

- Basic workflow configuration in `.replit`
- Build command: `npm run build`
- Start command: `npm run start`

## 7. Future Considerations

### 7.1 Scalability

- The current architecture should be monitored for performance as user base grows
- Consider implementing caching for frequently accessed data
- Potential for implementing server-side rendering or static generation for performance optimization

### 7.2 Feature Expansion

- The codebase is structured to allow for adding new villages, sectors, and mini-games
- AI Assistant integration could be expanded for more interactive guidance
- Potential for adding more sophisticated 3D visualizations and simulations

### 7.3 Security Enhancements

- Consider implementing refresh token mechanism for more secure authentication
- Add rate limiting for API endpoints
- Implement more granular access control for different user roles