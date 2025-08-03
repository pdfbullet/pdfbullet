import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '', '');
  return {
    base: '/ilovepdfly/',
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'icon.png'],
        workbox: {
          maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // ✅ increased limit
        },
        manifest: {
          name: 'I Love PDFLY',
          short_name: 'PDFLY',
          start_url: '.',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#007bff',
          icons: [
            {
              src: 'icon.png',
              sizes: '500x500',
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
