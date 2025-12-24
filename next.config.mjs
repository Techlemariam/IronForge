import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
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

export default withPWA(nextConfig);
