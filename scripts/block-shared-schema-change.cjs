// A partial Prisma schema must never reconcile/reset a database shared by apps.
// This entry point deliberately performs no database connection or mutation.
console.error(
  'This application now uses a shared database. Prisma db push, migrate, and reset ' +
  'are disabled because they can alter sibling application objects. Apply only ' +
  'reviewed migrations scoped to rimev_ tables using the authorized database tools.'
);
process.exitCode = 1;
