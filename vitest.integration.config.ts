import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'node', // Use node environment for Server Actions
        setupFiles: ['./tests/mocks/server.ts'], // Auto-start MSW if configured globally
        include: ['tests/integration/**/*.test.{ts,tsx}'],
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
});
