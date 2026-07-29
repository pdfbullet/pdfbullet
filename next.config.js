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
    };

    // Mock background removal on the server - only use real library on client
    if (isServer) {
      config.resolve.alias['@imgly/background-removal'] = path.resolve(__dirname, 'utils/mockBgRemoval.js');
    }

    // Treat onnxruntime-node as external so Webpack doesn't compile it
    config.externals = config.externals || [];
    config.externals.push('onnxruntime-node');

    // Skip ALL onnxruntime .mjs bundles (WebGPU, WASM etc) from webpack compilation.
    // These files use `import.meta` which is incompatible with webpack's CJS mode.
    // They are loaded at runtime by the browser directly, not bundled.
    const existingNoParse = Array.isArray(config.module?.noParse)
      ? config.module.noParse
      : config.module?.noParse
      ? [config.module.noParse]
      : [];

    config.module = {
      ...config.module,
      noParse: [
        ...existingNoParse,
        /onnxruntime[\\/].*\.mjs$/,
        /ort[\w.-]*\.mjs$/,
      ],
    };

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
