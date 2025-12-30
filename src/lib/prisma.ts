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
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString && (process.env.NODE_ENV === "test" || process.env.SKIP_ENV_VALIDATION === "true")) {
    connectionString = "postgresql://postgres:postgres@localhost:5432/postgres";
    process.env.DATABASE_URL = connectionString;
  }

  if (!connectionString) {
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
