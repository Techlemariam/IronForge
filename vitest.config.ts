import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    mockReset: true,
    alias: {
      '@': path.resolve(dirname, './src'),
      '@clerk/nextjs/server': path.resolve(dirname, './tests/mocks/clerk.ts')
    },
    exclude: ['**/node_modules/**', '**/tests/e2e/**', '**/*.stories.tsx', '**/*.stories.ts', '**/build/**', '**/dist/**'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'lcov']
    }
  }
});