// Mock for @clerk/nextjs/server
import { vi } from 'vitest';

export const auth = vi.fn(() => ({ userId: 'test-user-123' }));
export const currentUser = vi.fn(() => ({ id: 'test-user-123' }));
export const clerkClient = {};
