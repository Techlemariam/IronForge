import { PrismaClient } from "@prisma/client";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool as PgPool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import ws from "ws";

// Enable WebSocket for Neon in Node.js
if (typeof window === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    if (process.env.NODE_ENV === "test" || process.env.SKIP_ENV_VALIDATION === "true") {
      // Return a dummy client or allow it to be undefined/mocked in tests
      // to prevent "DATABASE_URL is not defined" from blocking unit tests or CI builds
      return new PrismaClient({
        datasourceUrl: "postgresql://postgres:postgres@localhost:5432/postgres"
      });
    }
    throw new Error("DATABASE_URL is not defined");
  }

  // Determine runtime and choose adapter accordingly for Prisma 7
  if (process.env.VERCEL || process.env.NEXT_RUNTIME === "edge") {
    // Neon adapter for Edge/Serverless
    const pool = new NeonPool({ connectionString });
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter: adapter as any });
  } else {
    // Standard PG adapter for Node.js/Local
    const pool = new PgPool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter: adapter as any });
  }
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;
export { prisma };

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
