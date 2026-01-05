import { config } from 'dotenv';
import path from 'path';

// Load environment variables immediately on import
// This ensures they are available when modules like src/lib/prisma.ts are loaded
config({ path: path.resolve(__dirname, '.env.test') });

// Fallback for Prisma 7 if still missing
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ironforge_test";
}

// Mock window.matchMedia if it doesn't exist (e.g. in JSDOM)
if (typeof window !== 'undefined' && !window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => { }, // deprecated
            removeListener: () => { }, // deprecated
            addEventListener: () => { },
            removeEventListener: () => { },
            dispatchEvent: () => false,
        }),
    });
}


// Global setup for Vitest
const setup = async () => {
    // any async setup if needed
};

export default setup;
