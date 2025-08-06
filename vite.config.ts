import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '');
  return {
    base: '/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png'],
        workbox: {
          maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
        },
        manifest: {
          name: 'I Love PDFLY',
          short_name: 'PDFLY',
          description: "The only PDF & Image toolkit you'll ever need. Merge, split, compress, convert, edit PDFs and more.",
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#B90B06',
          icons: [
            {
              src: 'favicon.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'favicon.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
      },
    },
  };
});