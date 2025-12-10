import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Standalone output mode - minimal production build
    output: 'standalone',

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
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
    },
};

export default nextConfig;

