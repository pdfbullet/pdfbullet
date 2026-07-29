import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    API_KEY: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
  },
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./prisma/dev.db'],
    },
  },
  webpack: (config, { isServer }) => {
    // Alias react-router-dom to compatibility layer
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-router-dom': path.resolve(__dirname, 'utils/routerCompat.tsx'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // Always mock @imgly/background-removal at build time for BOTH server and client.
      // The real library is loaded via dynamic import() at browser runtime only.
      // This prevents onnxruntime-web WebGPU bundles (which use import.meta) from
      // ever being processed by webpack/Terser — eliminating all build errors.
      '@imgly/background-removal': path.resolve(__dirname, 'utils/mockBgRemoval.js'),
    };

    // Treat onnxruntime-node as external so Webpack doesn't compile it
    config.externals = config.externals || [];
    config.externals.push('onnxruntime-node');

    // Handle .mjs files from node_modules using javascript/auto type.
    // This prevents webpack from enforcing strict ESM rules on these files.
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Resolve node module issues for client-side libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
      };
    }
    return config;
  },
};

export default nextConfig;
