# BizNest Migration Context

## Current Direction

BizNest started as a MongoDB + Mongoose backend. It was then scoped as a multitenant SaaS, but has been simplified to a normal e-commerce platform. The focus is now on system design and architecture for scale — handling heavy concurrent users, massive row counts, secured payments, and auth — rather than unique features.

## What To Treat As Legacy

- The old MongoDB / Mongoose schema ideas are historical reference only.
- Do not assume the existing NoSQL collection structure is the target architecture for the new backend.
- Any `mongoose`, `mongodb`, or collection-based data flow should be considered part of the previous implementation.

## New Backend Goal (NestJS Rebuild)

- **Framework: NestJS** — modular, opinionated architecture (controllers, services, modules, DTOs).
- PostgreSQL as the primary database (via Prisma or TypeORM — TBD when setup begins).
- Supabase for hosted Postgres and related backend workflows.
- Normalize the data model around relational tables instead of nested documents.
- The previous Prisma/Supabase backend scaffolding has been deleted — the NestJS backend will be built from scratch.

## Architecture & Scale Goals

- No multitenancy — plain e-commerce with a focus on **system design** over feature uniqueness.
- Use **Redis** for caching, session storage, and hot-path reads to keep the site responsive under load.
- Use **Bull MQ** (or equivalent) for background job processing — async tasks like order fulfillment, email notifications, and report generation.
- Handle **heavy concurrent users** and **massive row counts** with indexing, query optimization, connection pooling, and horizontal scaling patterns.
- **Secured payments** and **auth** using proven libraries (Stripe/PayPal, JWT/sessions, rate limiting, CSRF protection).
- The architecture should demonstrate production-grade patterns: load balancing, caching layers, queue-based async processing, database replication/read replicas, and observability.

## Important Design Context

- The old app used string-based relationships like `selleremail` and denormalized arrays for carts, ratings, and product variants.
- The new design should prefer proper foreign keys, join tables, and explicit timestamps.
- `Database_Draft.md` is the working relational schema idea and should be treated as the main planning document for database structure.

## Existing Product Shape

- Frontend exists in `Biznest-client/`.
- Legacy backend code still exists in `BizNest-server/` and `BizNest-server_v1/`.
- Migration work should be careful not to confuse legacy MongoDB code with the new Postgres backend plan.

## Working Rule For Future Threads

This project is now in a hybrid state — the old Express/MongoDB backend (BizNest-server_v1) still runs on Vercel for the live site, while the new NestJS backend is being built from scratch. When the user is ready, they will signal to begin setting up the NestJS project.

## Useful Files

- `Database_Draft.md`: planned relational schema
- `PROJECT_STATE.md`: older project summary
- `PROJECT_STATE2.md`: older project summary
- `Biznest-client/`: frontend
- `BizNest-server/`, `BizNest-server_v1/`: legacy backend code
