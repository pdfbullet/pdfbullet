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
          'desktop-view.jpg',
          'mobile-view.png',
        ],
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,jpg,jpeg,json,woff,woff2}'
          ],
          runtimeCaching: [
            {
              urlPattern: ({ request }) =>
                request.destination === 'script' ||
                request.destination === 'style',
              handler: 'StaleWhileRevalidate',
              options: { cacheName: 'static-resources' },
            },
            {
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: { cacheName: 'images' },
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
          theme_color: '#7c0a06ff',
          orientation: 'portrait-primary',
          dir: 'auto',
          categories: ['productivity', 'utilities', 'business'],
          icons: [
            { src: '/favicon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/apple-touch-icon.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
            { src: '/apple-touch-icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          screenshots: [
            { src: '/desktop-view.jpg', sizes: '1280x800', type: 'image/jpeg', form_factor: 'wide', label: 'Homepage with all tools' },
            { src: '/mobile-view.png', sizes: '540x720', type: 'image/png', form_factor: 'narrow', label: 'Mobile view' },
          ],
          edge_side_panel: { preferred_width: 480 },
          file_handlers: [
            {
              action: '/',
              accept: { 'application/pdf': ['.pdf'] },
              launch_type: 'single-client',
            },
          ],
          launch_handler: { client_mode: 'navigate-existing' },
          protocol_handlers: [{ protocol: 'web+pdfly', url: '/?url=%s' }],
        },
      }),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    build: {
      minify: 'esbuild',
      target: 'esnext',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom'], // split vendor
          },
        },
        input: {
          main: 'index.html',
        },
      },
    },
  };
});
