# Shared database cutover — prepared, not deployed

Destination: pvnpll (`shfkfqdfahnxodewxupi`). All Rimev application tables use `rimev_` names. Browser roles have no direct access; the existing server-side authorization remains responsible for application access.

The prefixed copy and authentication import must be verified before switching deployments. For matching email addresses, retain the destination account and password and remap Rimev-owned user foreign keys. Never update another application's tables, policies, or existing shared authentication accounts.

Before deploying this branch, securely configure the destination `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_PROJECT_REF` in each Rimev Vercel project. Never commit their values. Preserve current non-database environment settings. Confirm destination sign-in redirect settings and existing sibling apps' sign-in URLs without replacing their settings.

Re-run the row-by-row import verifier, test login and existing library data, and verify the health/stats routes against the destination before retiring the source. Existing sessions will require signing in again when changing the Supabase auth project.

Do not run Prisma db push/reset against the shared database: the schema contains sibling application tables that Prisma does not manage. Apply only the reviewed prefixed migration. Do not clear or rename the source project while any deployment still uses it.

The `db:push`, `db:migrate`, and `db:reset` npm commands now fail before making any connection. This prevents a partial application schema from reconciling or resetting sibling objects. Prisma client generation and read-only developer tools remain available.
