import { PrismaClient } from "@prisma/client";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (!url) return undefined;

  // On Supabase pooler, port 5432 is session mode (strictly limited to 15 clients).
  // Port 6543 is transaction pooler (PgBouncer) which handles serverless concurrency without connection exhaustion.
  if (url.includes("pooler.supabase.com:5432")) {
    url = url.replace(":5432", ":6543");
  }

  // Prisma / PgBouncer: disable prepared statements to avoid "already exists" errors
  if (!url.includes("pgbouncer=true")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}pgbouncer=true`;
  }

  // In serverless environments (Vercel), each lambda only needs 1 connection from the pool
  if (!url.includes("connection_limit=")) {
    const separator = url.includes("?") ? "&" : "?";
    url = `${url}${separator}connection_limit=1`;
  }

  const verifiedUrl = new URL(url);
  verifiedUrl.searchParams.set("sslmode", "require");
  verifiedUrl.searchParams.set("sslaccept", "strict");
  verifiedUrl.searchParams.set("sslcert", path.join(process.cwd(), "prisma", "supabase-ca.crt"));
  return verifiedUrl.toString();
}


export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: { url: getDatabaseUrl() },
    },
  });

// Reuse the client across warm serverless invocations (Vercel).
globalForPrisma.prisma = prisma;
