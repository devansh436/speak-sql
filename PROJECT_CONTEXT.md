# Project Context

This file is the working memory for AI-assisted feature development in this repository. Update it whenever the architecture, setup, or conventions change.

## Project Summary

Speak SQL is a full-stack natural-language-to-SQL app for a library-style dataset. The frontend is a React + Vite app and the backend is an Express API that combines Firebase Auth-backed user identity with MongoDB profile storage and MySQL query execution.

## Core Goals

- Let users ask questions in natural language and convert them into SQL.
- Protect query execution behind authentication and role-based access control.
- Keep the UI responsive, clear, and easy to use for query review and results.
- Support local development and Vercel deployment.

## Stack

- Client: React 19, Vite, React Router, MUI, Axios
- Server: Node.js, Express 5, Firebase Admin, MongoDB, MySQL, mysql2
- AI / SQL: LLM-backed SQL generation and validation services in the server layer
- Deployment: Vercel for client and serverless API entry points

## Repository Layout

- client/ - Vite React app
- server/ - Express API, auth, query execution, and database utilities
- README.md - high-level product and deployment notes

## Client Entry Points

- client/src/main.jsx - React bootstrap
- client/src/App.jsx - app shell, routing, auth gating, backend health check
- client/src/context/AuthContext.jsx - auth state provider
- client/src/services/api.js - API client
- client/src/pages/ - route-level screens
- client/src/components/ - reusable UI components

## Server Entry Points

- server/server.js - Express app, middleware, routes, and health endpoints
- server/routes/authRoutes.js - registration/login/session routes
- server/routes/queryRoutes.js - query execution and schema endpoints
- server/routes/adminRoutes.js - admin-only routes
- server/services/sqlService.js - SQL execution and validation logic
- server/services/llmService.js - natural-language-to-SQL generation
- server/utils/schemaExtractor.js - schema inspection helpers

## Local Dev Commands

- Client: cd client && npm install && npm run dev
- Server: cd server && npm install && npm run dev

## Environment Notes

- Keep Firebase Admin credentials, MongoDB credentials, and MySQL connection details in server environment variables.
- Keep MySQL connection details in server environment variables.
- Keep any Gemini or other LLM keys in server environment variables.
- The client should point to the running API through the configured base URL in client/src/services/api.js.

## Firebase Auth Notes

- Client Firebase config lives in client/src/firebase.js and uses dummy placeholders until real env values are added.
- Server Firebase Admin config lives in server/config/firebaseAdmin.js and expects FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.
- Login/register are handled by Firebase on the client; the backend only verifies Firebase ID tokens and hydrates a local user profile.
- Roles still come from the MongoDB user profile and drive query/admin permissions.

## Important Behavior

- Backend health is checked from the client on app load.
- Authentication is required for the protected routes in the client.
- The backend supports Firebase-backed identity plus MongoDB user profiles and MySQL query execution.
- CORS handling in server/server.js is customized for localhost and Vercel origins.

## AI Editing Notes

- Prefer small, local changes that preserve existing routing and API shapes.
- When adding features, update this file with new routes, services, environment variables, or deployment details.
- If behavior changes, document the new flow here before moving on to adjacent work.
