import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        include: ['**/*.integration.test.ts', 'src/actions/__tests__/hevy.test.ts'], // Explicitly include integration tests
        setupFiles: ['./vitest.setup.integration.ts']
    },
});
