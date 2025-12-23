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

export default nextConfig;
