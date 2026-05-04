# BizNest Migration Context

## Current Direction

BizNest started as a MongoDB + Mongoose backend. The project is now being rebuilt around PostgreSQL, Prisma, and Supabase.

## What To Treat As Legacy

- The old MongoDB / Mongoose schema ideas are historical reference only.
- Do not assume the existing NoSQL collection structure is the target architecture for the new backend.
- Any `mongoose`, `mongodb`, or collection-based data flow should be considered part of the previous implementation.

## New Backend Goal

- Use PostgreSQL as the primary database.
- Use Prisma for schema, relations, and database access.
- Use Supabase for hosted Postgres and related backend workflows.
- Normalize the data model around relational tables instead of nested documents.

## Important Design Context

- The old app used string-based relationships like `selleremail` and denormalized arrays for carts, ratings, and product variants.
- The new design should prefer proper foreign keys, join tables, and explicit timestamps.
- `Database_Draft.md` is the working relational schema idea and should be treated as the main planning document for database structure.

## Existing Product Shape

- Frontend exists in `Biznest-client/`.
- Legacy backend code still exists in `BizNest-server/` and `BizNest-server_v2/`.
- Migration work should be careful not to confuse legacy MongoDB code with the new Postgres backend plan.

## Working Rule For Future Threads

If a new conversation starts, first assume the task is about the PostgreSQL / Prisma / Supabase rebuild unless the user explicitly says otherwise.

## Useful Files

- `Database_Draft.md`: planned relational schema
- `PROJECT_STATE.md`: older project summary
- `PROJECT_STATE2.md`: older project summary
- `Biznest-client/`: frontend
- `BizNest-server/`, `BizNest-server_v2/`: legacy backend code
