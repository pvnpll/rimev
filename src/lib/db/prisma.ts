import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFileSync } from "node:fs";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  let url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for the Rimev server");

  // On Supabase pooler, port 5432 is session mode (strictly limited to 15 clients).
  // Port 6543 is transaction pooler (PgBouncer) which handles serverless concurrency without connection exhaustion.
  if (url.includes("pooler.supabase.com:5432")) {
    url = url.replace(":5432", ":6543");
  }

  const verifiedUrl = new URL(url);
  // pg URL SSL options override the explicit ssl object. Keep certificate and
  // hostname verification in one place, in the driver configuration below.
  for (const key of ["sslmode", "sslaccept", "sslcert", "sslrootcert", "sslkey", "pgbouncer", "connection_limit"]) {
    verifiedUrl.searchParams.delete(key);
  }
  return verifiedUrl.toString();
}


export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    adapter: new PrismaPg({
      connectionString: getDatabaseUrl(),
      max: 1,
      ssl: {
        rejectUnauthorized: true,
        ca: readFileSync(path.join(process.cwd(), "prisma", "supabase-ca.crt"), "utf8"),
      },
    }),
  });

// Reuse the client across warm serverless invocations (Vercel).
globalForPrisma.prisma = prisma;
