import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Trailing slash to avoid redirect issues on shared hosting
    trailingSlash: true,

    // Enable compression
    compress: true,

    // Skip TypeScript errors during build (scripts folder)
    typescript: {
        ignoreBuildErrors: true,
    },

    // Image configuration - unoptimized for shared hosting
    images: {
        unoptimized: true, // Disable Next.js image optimization
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'canhohanghieu.com',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
    },
};

export default nextConfig;

