import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Singleton Prisma client setup.
 * In development, the client is cached on `globalThis` to prevent
 * creating multiple instances during hot-reloading.
 */

// Extend the global scope to hold a persistent Prisma instance across hot reloads
declare global {
  var prisma: PrismaClient | undefined;
  var pgPool: Pool | undefined;
}

const dataSourceUrl = process.env.DATABASE_URL;
if (!dataSourceUrl) throw new Error("DATABASE_URL is not set");

// Append uselibpqcompat=1 to the connection string to fix pg v9.0.0 warning
let poolConnectionString = dataSourceUrl;
try {
  const url = new URL(dataSourceUrl);
  if (url.searchParams.get("sslmode") === "require") {
    url.searchParams.set("uselibpqcompat", "1");
  }
  poolConnectionString = url.toString();
} catch (e) {
  console.error("Failed to parse DATABASE_URL", e);
}

const pool = globalThis.pgPool || new Pool({ connectionString: poolConnectionString });
if (process.env.NODE_ENV !== "production") globalThis.pgPool = pool;

const adapter = new PrismaPg(pool);

// Reuse the existing global instance if available; otherwise, create a new one
export const db = globalThis.prisma || new PrismaClient({ adapter });

// Cache the client globally in non-production environments to survive hot reloads
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
