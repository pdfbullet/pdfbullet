import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '');
  return {
    base: '/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.png',
          'apple-touch-icon.png',
          'desktop-view.jpg', // must be in /public
          'mobile-view.png',  // must be in /public
        ],
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB cache limit
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,woff,woff2}'
          ],
        },
        manifest: {
          name: 'I Love PDFLY',
          short_name: 'PDFLY',
          description: "Free PDF & Image Toolkit",
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#0078d7',
          orientation: 'portrait-primary',
          categories: ['productivity', 'utilities', 'business'],
          icons: [
            { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
          ],
          screenshots: [
            {
              src: '/desktop-view.jpg',
              sizes: '1280x800',
              type: 'image/jpeg',
              form_factor: 'wide',
              label: 'I Love PDFLY Homepage with all tools',
            },
            {
              src: '/mobile-view.png',
              sizes: '540x720',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Mobile view showing PDF tools',
            },
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
          main: 'index.html',
        },
      },
    },
  };
});