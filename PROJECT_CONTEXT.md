# Project Context

This file is the working memory for AI-assisted development in this repository. It reflects the current architecture, workflows, conventions, and integration points as of 2026-07-25.
  
## Project Summary

SpeakSQL is a full-stack application that lets authenticated users ask natural-language questions and receive database-backed results from a MySQL dataset. The product is centered around a library-style dataset and combines:

- a React + Vite frontend for querying, browsing tables, and managing users,
- an Express backend for authentication, role-based access control, and SQL execution,
- Firebase Authentication for identity,
- MongoDB for user profile persistence,
- MySQL for the actual data source,
- an LLM-based SQL generation flow for translating natural-language questions into SQL.

## Current Product Goals

- Allow users to ask questions in plain English and receive query results from a relational database.
- Enforce authentication and role-based permissions for every protected query path.
- Provide a simple, polished UI for exploring tables and viewing results.
- Support a local development workflow and deployment-friendly server structure.
- Keep admin operations such as role changes and user deletion available to authorized administrators.

## High-Level Architecture

The project is split into two main parts:

- Client: a React single-page app with route-based pages and MUI styling.
- Server: an Express application with modular route handlers, controllers, middleware, services, and config modules.

The current backend entrypoint is split between:

- [server/app.js](server/app.js): Express app definition, middleware, route mounting, and global error handling.
- [server/server.js](server/server.js): startup/bootstrap logic that connects MongoDB and starts the app.

## Frontend Overview

The frontend lives in [client/src](client/src) and is built with React 19, Vite, React Router, Material UI, and Firebase client SDK.

### Main client files

- [client/src/App.jsx](client/src/App.jsx): app shell, route setup, protected routes, and backend health warning banner.
- [client/src/context/AuthContext.jsx](client/src/context/AuthContext.jsx): authentication state, Firebase auth listeners, login/register/logout actions, and backend sync behavior.
- [client/src/services/api.js](client/src/services/api.js): centralized API client for auth, query, schema, tables, and health requests.
- [client/src/firebase.js](client/src/firebase.js): Firebase client initialization.
- [client/src/pages/HomePage.jsx](client/src/pages/HomePage.jsx): natural-language query UI and permission display.
- [client/src/pages/TablesPage.jsx](client/src/pages/TablesPage.jsx): table browsing experience with role-based data access and local cache.
- [client/src/pages/AdminPanel.jsx](client/src/pages/AdminPanel.jsx): admin-only user management interface.
- [client/src/components/Navbar.jsx](client/src/components/Navbar.jsx): top navigation and role-aware menu.

### Frontend behavior

- The app checks backend health on startup and shows a warning if the server is unavailable.
- Authenticated users are redirected to login unless their Firebase session is active.
- The home page loads the current user's role permissions and shows allowed tables and operations.
- The tables page uses a server endpoint that returns rows from the tables the current role is allowed to access.
- The admin panel allows admins to view users, change roles, and delete users.

## Backend Overview

The backend lives in [server](server) and is structured around Express routes, controllers, middleware, services, and configuration modules.

### Current backend structure

- [server/app.js](server/app.js): main Express app setup with CORS, JSON parsing, route mounting, and error handling.
- [server/server.js](server/server.js): startup logic for MongoDB initialization and listening on the configured port.
- [server/routes](server/routes): route definitions for auth, admin, health, and querying.
- [server/controllers](server/controllers): controller modules that hold the actual request-handler logic.
- [server/middleware](server/middleware): auth and role validation middleware.
- [server/services](server/services): SQL execution and LLM-based SQL generation logic.
- [server/config](server/config): database and Firebase configuration helpers.
- [server/models](server/models): Mongoose schemas.
- [server/utils](server/utils): helpers such as schema extraction.

## Authentication and User Model

Authentication is Firebase-based on the client and server.

### Client-side auth

- The frontend uses Firebase Auth for email/password login, Google sign-in, and session persistence.
- After authentication, the app requests the backend user profile and syncs it with MongoDB.

### Server-side auth

- The backend verifies Firebase ID tokens via the Firebase Admin SDK.
- If the token is valid, the server upserts a MongoDB user profile linked by Firebase UID.
- The server attaches the resolved user object to the request, including role and profile fields.

### User roles

The supported roles are:

- USER
- STAFF
- ADMIN

Roles are stored in MongoDB and used for both query restrictions and administrative access.

## Role-Based Access Control

Role-based access is enforced in two layers:

1. Middleware-level access control
   - [server/middleware/auth.js](server/middleware/auth.js): validates the Firebase token and attaches user data to the request.
   - [server/middleware/roleValidator.js](server/middleware/roleValidator.js): defines role permissions and validates generated SQL against them.

2. Route-level access control
   - Protected query endpoints require authentication.
   - Admin routes require both authentication and the ADMIN role.

### Role permissions currently defined

- USER: allowed to read the books table only.
- STAFF: allowed to read and modify books, members, and transactions.
- ADMIN: allowed full access to all tables and schema-changing operations.

The validator also blocks common SQL injection patterns and multiple-statement SQL.

## Query Flow

The main NL-to-SQL flow works like this:

1. The client sends a natural-language question to the backend.
2. The server controller receives the request and checks that the user is authenticated.
3. The server uses [server/services/sqlService.js](server/services/sqlService.js) to run the NLQ pipeline.
4. The SQL service calls [server/services/llmService.js](server/services/llmService.js) to generate SQL from the question and the database schema.
5. The generated SQL is validated against the current user's role using [server/middleware/roleValidator.js](server/middleware/roleValidator.js).
6. If allowed, the query is executed against MySQL and returned to the client.
7. If blocked, the server returns a role-based error or unauthorized response.

## Database Layer

### MySQL

- The app uses MySQL through the `mysql2/promise` pool defined in [server/config/db.js](server/config/db.js).
- The main data source is a library-style relational dataset.
- Query execution is done dynamically from generated SQL, with role-based constraints.

### MongoDB

- MongoDB is used for persistent user profiles and admin management.
- The main schema is [server/models/User.js](server/models/User.js).
- MongoDB connection setup is handled by [server/config/mongodb.js](server/config/mongodb.js).

## API Surface

The current backend exposes these route groups:

- POST /api/query: run a natural-language query.
- GET /api/schema: return schema information for the current role.
- GET /api/permissions: return the current user’s permissions.
- GET /api/tables: return table data accessible to the current role.
- GET /api/auth/me: return the current authenticated user profile.
- GET /api/auth/permissions: return the authenticated user’s permissions.
- GET /api/auth/status: return Firebase Admin configuration status.
- GET /api/health: return server, MongoDB, and MySQL health info.
- GET /api/admin/users: admin-only list of users.
- PATCH /api/admin/users/:userId/role: admin-only role update.
- DELETE /api/admin/users/:userId: admin-only user deletion.
- GET /api/admin/stats: admin-only user statistics.

## Environment Variables

The app expects environment variables in the server environment and client environment.

### Server variables

- `DATABASE_URL`: MySQL connection string or pool configuration URL.
- `MONGODB_URI`: MongoDB connection string.
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, defaults to a Gemini Flash model)
- `PORT` (optional, defaults to 5000)

### Client variables

- `VITE_API_URL`: API base URL for the frontend.
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## Development Workflow

### Install dependencies

- Client: `cd client && npm install`
- Server: `cd server && npm install`

### Run locally

- Client: `cd client && npm run dev`
- Server: `cd server && npm run dev`

### Tests

The server uses Vitest and Supertest. The scripts are defined in [server/package.json](server/package.json).

## Deployment Notes

The project is designed to be deployable with a Vercel-style frontend/backend setup, but the current local server structure is the primary development path. The frontend uses Vite and the backend uses Express with a startup script that can run in a server environment.

## Important Implementation Notes

- The server currently uses controller modules under [server/controllers](server/controllers) for request handling rather than keeping large handlers inline in route files.
- The frontend uses localStorage caching on the tables page to reduce repeated database fetches.
- The app uses a protected-route pattern in the React app to gate access to application screens.
- The backend is intentionally defensive: it validates generated SQL and blocks unsafe or unauthorized query patterns.

## Editing Guidance

When making changes:

- preserve the current route structure unless a refactor is explicitly intended,
- keep auth and RBAC behavior intact,
- update this file whenever architecture, routes, services, or environment requirements change,
- prefer small, localized changes that maintain the existing API contract.
