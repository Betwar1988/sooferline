/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'xhqhjkxbcmopjvaoblmx.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
        ],
    },
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        config.resolve.alias.fs = false;
        config.resolve.alias.path = false;
        config.resolve.alias.http = false;
        config.resolve.alias.https = false;
        return config;
    },
};

export default nextConfig;
