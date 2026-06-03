import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Krishi Khata — Smart Farm Ledger',
        short_name: 'Khata',
        description: 'Digital bahi-khata for Indian farmers. Track crops, expenses, and mandi prices.',
        theme_color: '#052e16',
        background_color: '#fbf9f6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: '/index.html',
        // Pre-cache the app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Runtime caching strategies for API calls
        runtimeCaching: [
          {
            // StaleWhileRevalidate for read-heavy GET endpoints
            // Serves cached data instantly, then updates cache in background
            urlPattern: /^https:\/\/krishi-khata\.onrender\.com\/api\/v1\/(farms|khata\/summary|crop-presets)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-stale-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // NetworkFirst for user-generated data (must be accurate)
            urlPattern: /^https:\/\/krishi-khata\.onrender\.com\/api\/v1\/(khata\/transactions|farms\/\d+\/crops)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-network-first',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 12, // 12 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // StaleWhileRevalidate for weather & mandi (changes daily)
            urlPattern: /^https:\/\/krishi-khata\.onrender\.com\/api\/v1\/(weather|mandi)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-external-data',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 6, // 6 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
