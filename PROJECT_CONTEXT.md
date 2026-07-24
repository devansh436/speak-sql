# Project Context

This file is the working memory for AI-assisted feature development in this repository. Update it whenever the architecture, setup, or conventions change.

## Project Summary

Speak SQL is a full-stack natural-language-to-SQL app for a library-style dataset. The frontend is a React + Vite app and the backend is an Express API that combines MongoDB authentication with MySQL query execution.

## Core Goals

- Let users ask questions in natural language and convert them into SQL.
- Protect query execution behind authentication and role-based access control.
- Keep the UI responsive, clear, and easy to use for query review and results.
- Support local development and Vercel deployment.

## Stack

- Client: React 19, Vite, React Router, MUI, Axios
- Server: Node.js, Express 5, MongoDB, MySQL, bcryptjs, jsonwebtoken, mysql2
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

- Keep MongoDB credentials and JWT secrets in server environment variables.
- Keep MySQL connection details in server environment variables.
- Keep any Gemini or other LLM keys in server environment variables.
- The client should point to the running API through the configured base URL in client/src/services/api.js.

## Important Behavior

- Backend health is checked from the client on app load.
- Authentication is required for the protected routes in the client.
- The backend supports both MongoDB-backed auth state and MySQL query execution.
- CORS handling in server/server.js is customized for localhost and Vercel origins.

## AI Editing Notes

- Prefer small, local changes that preserve existing routing and API shapes.
- When adding features, update this file with new routes, services, environment variables, or deployment details.
- If behavior changes, document the new flow here before moving on to adjacent work.
