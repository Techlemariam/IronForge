import type { StorybookConfig } from '@storybook/nextjs-vite';
import { fileURLToPath } from "url";
import { dirname } from "path";

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

    // Manually reconstruct the '@' alias to ensure cross-environment stability
    // instead of relying on vite-tsconfig-paths which might hit resolution issues in Storybook's isolated build context
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
      '@/types/prisma': path.resolve(__dirname, 'prisma-mock.ts'),
      '@/lib/prisma': path.resolve(__dirname, 'lib-prisma-mock.ts'),
      '@prisma/client': path.resolve(__dirname, 'prisma-mock.ts'),
      '.prisma/client': path.resolve(__dirname, 'prisma-mock.ts'),
      'next/headers': path.resolve(__dirname, 'next-headers-mock.ts'),
    };

    // Disable sourcemaps to prevent resolution errors with framer-motion/React 19
    config.build = config.build || {};
    config.build.sourcemap = false;

    // Suppress "Module level directives" warnings (e.g. "use client") which are noisy in Vite
    config.build.rollupOptions = {
      ...config.build.rollupOptions,
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        if (warning.message.includes('use client')) {
          return;
        }
        warn(warning);
      },
    };

    // Use Vite 7 onLog API for better control over logging noise
    // @ts-ignore - onLog is available in Vite 7
    config.onLog = (level, log, defaultHandler) => {
      if (log.message.includes('use client')) {
        return false;
      }
      if (log.message.includes('sourcemap')) {
        return false;
      }
      return defaultHandler(level, log);
    };

    // Ensure react-player and other problematic libs are properly optimized
    config.optimizeDeps = config.optimizeDeps || {};
    config.optimizeDeps.include = [
      ...(config.optimizeDeps.include || []),
      'react-player',
      'react-player/lazy',
      'react-player/youtube',
      'framer-motion',
      'sonner'
    ];

    // Define process.env to prevent "process is not defined" in some libs
    config.define = {
      ...config.define,
      'process.env': {}
    };


    return config;
  }
};
export default config;