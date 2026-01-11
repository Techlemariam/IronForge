import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@clerk/nextjs/server': path.resolve(__dirname, './tests/mocks/clerk.ts'),
        },
        exclude: ['**/node_modules/**', '**/tests/e2e/**'],
        setupFiles: ['./vitest.setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json-summary', 'html'],
        },
    },
});
