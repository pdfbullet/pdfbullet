import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '');
  return {
    base: '/', // correct for custom domain
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'apple-touch-icon.png'],
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // safer limit for GitHub Pages
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        },
        manifest: {
          name: 'I Love PDFLY: PDF & Image Tools',
          short_name: 'PDFLY',
          description:
            "The only PDF & Image toolkit you'll ever need. Merge, split, compress, convert, edit PDFs and more.",
          start_url: '/', // fixed from "."
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
          main: resolve(__dirname, 'index.html'), // safer resolve
        },
      },
    },
  };
});
