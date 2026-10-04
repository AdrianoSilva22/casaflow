import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  __casaflowPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.__casaflowPrisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__casaflowPrisma = prisma;
}

export const DEFAULT_FAMILY_ID = "family_casaflow";
