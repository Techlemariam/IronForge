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

// Compose plugins: Serwist (PWA) → Sentry → Next.js
export default withSentryConfig(withSerwist(nextConfig), sentryConfig);
