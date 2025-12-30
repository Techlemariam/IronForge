import { config } from 'dotenv';
import path from 'path';

// Load environment variables immediately on import
// This ensures they are available when modules like src/lib/prisma.ts are loaded
config({ path: path.resolve(__dirname, '.env.test') });

// Fallback for Prisma 7 if still missing
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ironforge_test";
}

// Global setup for Vitest
export default async () => {
    // any async setup if needed
};
