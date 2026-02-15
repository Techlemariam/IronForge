// Fallback for Prisma 7 if missing
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
            addListener: () => { },
            removeListener: () => { },
            addEventListener: () => { },
            removeEventListener: () => { },
            dispatchEvent: () => false,
        }),
    });
}


// Global setup for Vitest
import { vi } from 'vitest';


// Mock Next.js Headers - Global
vi.mock('next/headers', () => ({
    cookies: vi.fn(async () => ({
        getAll: vi.fn(() => []),
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
    })),
    headers: vi.fn(async () => new Map()),
}));

// Mock Supabase Server Client - Global
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(async () => ({
        auth: {
            getUser: vi.fn(async () => ({
                data: { user: { id: 'test-user-123' } },
                error: null,
            })),
            getSession: vi.fn(async () => ({
                data: { session: null },
                error: null,
            })),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
    })),
}));

// Prisma is mocked locally in test files to prevent conflicts

const setup = async () => {
    // any async setup if needed
};

export default setup;
