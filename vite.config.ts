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
          'favicon.svg',
          'apple-touch-icon.png',
          'desktop-view.jpg', // must be in /public
          'mobile-view.png',  // must be in /public
        ],
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB cache limit
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,woff,woff2}'
          ],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 Days
              },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 Days
              },
            },
            {
              urlPattern: new RegExp('^https://fonts\\.googleapis\\.com/.*', 'i'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
              },
            },
            {
              urlPattern: new RegExp('^https://fonts\\.gstatic\\.com/.*', 'i'),
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 }, // 1 Year
              },
            },
          ],
        },
        manifest: {
          name: 'I Love PDFLY: PDF & Image Tools',
          short_name: 'PDFLY',
          description:
            "The only PDF & Image toolkit you'll ever need. Merge, split, compress, convert, edit PDFs and more.",
          start_url: '/',
          id: '/',
          display: 'standalone',
          display_override: ['window-controls-overlay'],
          background_color: '#ffffff',
          theme_color: '#da9707ff',
          orientation: 'portrait-primary',
          dir: 'ltr',
          categories: ['productivity', 'utilities', 'business'],
          icons: [
            { src: '/favicon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' },
            { src: '/apple-touch-icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          screenshots: [
            {
              src: '/desktop-view.jpg',
              sizes: '1280x800',
              type: 'image/jpeg',
            },
            {
              src: '/mobile-view.png',
              sizes: '540x720',
              type: 'image/png',
            },
          ],
          edge_side_panel: {
            preferred_width: 480
          },
          file_handlers: [
            {
              action: '/',
              accept: {
                'application/pdf': ['.pdf'],
              },
            }
          ],
          launch_handler: {
            client_mode: 'navigate-existing'
          },
          protocol_handlers: [
            {
              protocol: 'web+pdfly',
              url: '/?url=%s'
            }
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