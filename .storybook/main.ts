import type { StorybookConfig } from '@storybook/nextjs-vite';

import { dirname } from "path"

import { fileURLToPath } from "url"

/**
* This function is used to resolve the absolute path of a package.
* It is needed in projects that use Yarn PnP or are set up within a monorepo.
*/
function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  "addons": [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-onboarding')
  ],
  "framework": getAbsolutePath('@storybook/nextjs-vite'),
  "staticDirs": [
    "../public"
  ],
  "typescript": {
    "reactDocgen": false
  },
  async viteFinal(config) {
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    // Mock Prisma types for browser compatibility
    // Alias @/types/prisma to our mock instead of letting it import from @prisma/client
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/types/prisma': path.resolve(__dirname, 'prisma-mock.ts'),
      '@prisma/client': path.resolve(__dirname, 'prisma-mock.ts'),
      '.prisma/client': path.resolve(__dirname, 'prisma-mock.ts'),
      '.prisma/client/index-browser': path.resolve(__dirname, 'prisma-mock.ts'),
    };
    return config;
  }
};
export default config;