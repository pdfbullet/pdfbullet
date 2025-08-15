import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '');

  return {
    base: '/', // works for custom domains like ilovepdfly.com
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.png',
          'apple-touch-icon.png',
          'desktop-view.jpg',
          'mobile-view.png',
        ],
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,woff,woff2}',
          ],
        },
        manifest: {
          name: 'I Love PDFLY: PDF & Image Tools',
          short_name: 'PDFLY',
          description: "The ultimate PDF & Image toolkit online.",
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#B90B06',
          orientation: 'portrait-primary',
          categories: ['productivity', 'utilities', 'business'],
          icons: [
            { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
            { src: '/favicon.png', sizes: '512x512', type: 'image/png' },
            { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
            { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          ],
          screenshots: [
            { src: '/desktop-view.jpg', sizes: '1280x800', type: 'image/jpeg', form_factor: 'wide', label: 'Desktop view' },
            { src: '/mobile-view.png', sizes: '540x720', type: 'image/png', form_factor: 'narrow', label: 'Mobile view' },
          ],
        },
      }),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      chunkSizeWarningLimit: 2000, // increases warning limit to 2MB
    },
  };
});
