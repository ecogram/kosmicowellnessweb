# Kosmico Wellness E-Commerce

## Project Overview

A production-grade, highly scalable D2C MERN e-commerce application for Kosmico Wellness (Monk Fruit Sweetener). The platform is architected to eventually support 100,000+ concurrent users with zero single-server dependencies.

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS, React Router, Zustand, TanStack Query
- **Backend**: Node.js, Express.js (MVC Architecture)
- **Database**: MongoDB (Atlas for Production)
- **Caching & Queue**: Redis + BullMQ
- **Containerization**: Docker, Docker Compose

## Development Prerequisites

- Node.js >= 20
- Docker & Docker Compose
- Git

## Folder Structure

- `/frontend` - React/Vite client application
- `/backend` - Express API application
- `/worker` - BullMQ background job processor
- `/docs` - Project planning and architecture documentation

## Environment Configuration

1. Copy `.env.example` to `.env` in the root directory.
2. Fill in the local development environment variables.

## Local Docker Setup

To start the entire stack (Frontend, Backend, Worker, MongoDB, Redis) in development mode:

```bash
npm run dev
```

## Available Commands (from root)

- `npm run frontend` - Start frontend dev server only
- `npm run backend` - Start backend dev server only
- `npm run worker` - Start background worker only
- `npm run lint` - Run ESLint across project
- `npm run format` - Format code with Prettier
- `npm run build` - Build the frontend for production

## Current Project State

### COMPLETED

- Phase 1: Product Planning (Documentation)
- Phase 2: UI/UX System (Documentation)

### CURRENT FOUNDATION (Phase 3 Completed)

- **Monorepo setup**: Root `package.json` with workspace commands.
- **Frontend foundation**: React + Vite + Tailwind configured (empty routes).
- **Backend foundation**: Express MVC skeleton, rate limiting, MongoDB config.
- **Worker foundation**: Basic worker process starting up.
- **Docker infrastructure**: Compose files for local development.

### FUTURE PHASES (Not Yet Implemented)

- Phase 4: Frontend UI Implementation
- Phase 5: Backend Features & DB Models
- Phase 6+: Authentication, Cart, Checkout, Payments, Redis caching, 100K load capacity

## Scalability Architecture Overview

- **Stateless APIs**: The Node.js instances do not store local sessions or uploads.
- **Horizontal Scaling**: Because APIs are stateless, `N` replicas of the backend container can run behind a load balancer.
- **Background Processing**: Heavy tasks (emails, webhooks) are offloaded to separate worker processes.
- **Database Read Scaling**: MongoDB Atlas will handle heavy read loads.
