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

    // Mock Prisma and Next.js server modules for browser compatibility
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/types/prisma': path.resolve(__dirname, 'prisma-mock.ts'),
      '@/lib/prisma': path.resolve(__dirname, 'lib-prisma-mock.ts'),
      '@prisma/client': path.resolve(__dirname, 'prisma-mock.ts'),
      '.prisma/client': path.resolve(__dirname, 'prisma-mock.ts'),
      'next/headers': path.resolve(__dirname, 'next-headers-mock.ts'),
    };

    // Disable sourcemaps to prevent resolution errors with framer-motion/React 19
    config.build = config.build || {};
    config.build.sourcemap = false;

    return config;
  }
};
export default config;