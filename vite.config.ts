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
        includeAssets: ['favicon.png', 'apple-touch-icon.png'],
        workbox: {
          maximumFileSizeToCacheInBytes: 30 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        },
        manifest: {
          name: 'I Love PDFLY: PDF & Image Tools',
          short_name: 'PDFLY',
          description: "The only PDF & Image toolkit you'll ever need. Merge, split, compress, convert, edit PDFs and more.",
          start_url: '.',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#B90B06',
          orientation: 'portrait-primary',
          categories: ['productivity', 'utilities', 'business'],
          icons: [
            {
              src: '/favicon.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/favicon.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/favicon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png'
            }
          ],
          screenshots: [
            {
              "src": "https://ik.imagekit.io/fonepay/desktop%20view.JPG?updatedAt=1754724809176",
              "sizes": "1280x800",
              "type": "image/jpeg",
              "form_factor": "wide",
              "label": "I Love PDFLY Homepage with all tools"
            },
            {
              "src": "https://ik.imagekit.io/fonepay/mobile%20view.PNG?updatedAt=1754724811765",
              "sizes": "540x720",
              "type": "image/png",
              "form_factor": "narrow",
              "label": "Mobile view showing PDF tools"
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
          main: resolve('index.html'),
        },
      },
    },
  };
});