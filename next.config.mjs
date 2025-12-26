import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
    swSrc: "src/app/sw.ts",
    swDest: "public/sw.js",
    disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
    reactStrictMode: true,
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

export default withSerwist(nextConfig);
