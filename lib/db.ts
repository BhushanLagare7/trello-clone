import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Singleton Prisma client setup using the PostgreSQL adapter.
 * In development, the client is cached on `globalThis` to prevent
 * creating multiple instances during hot-reloading.
 */

// Extend the global scope to hold a persistent Prisma instance across hot reloads
declare global {
  var prisma: PrismaClient | undefined;
}

const dataSourceUrl = process.env.DATABASE_URL;

if (!dataSourceUrl) throw new Error("DATABASE_URL is not set");

// Initialize the PostgreSQL adapter with the connection string
const adapter = new PrismaPg({ connectionString: dataSourceUrl });

// Reuse the existing global instance if available; otherwise, create a new one
export const db = globalThis.prisma || new PrismaClient({ adapter });

// Cache the client globally in non-production environments to survive hot reloads
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
