import withSerwistInit from "@serwist/next";
import { withSentryConfig } from "@sentry/nextjs";
import "./src/env.mjs";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Required for Docker production builds
  transpilePackages: ['@supabase/ssr', '@supabase/supabase-js'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      }
    ]
  }
};

// Sentry configuration options
const sentryConfig = {
  // Upload source maps for better stack traces
  silent: true, // Suppress Sentry CLI output
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps in CI
  disableSourceMapUpload: !process.env.CI,

  // Hide source maps from client bundles
  hideSourceMaps: true,

  // Tunnel Sentry requests to avoid ad-blockers (optional)
  // tunnelRoute: "/monitoring",
};

// Compose plugins: Serwist (PWA) -> Next.js
// Temporarily disabled due to Next.js 16 compatibility issues
// export default withSerwist(nextConfig);
export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "techlemariam",

  project: "ironforge-rpg",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
