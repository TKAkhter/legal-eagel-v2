/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync(`${import.meta.dirname}/package.json`, 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Precache the app shell only — this app's data is API-driven
      // (mock or real), not something that should be cached as static
      // assets. Runtime API caching can be added under `workbox` here
      // later if offline data access becomes a real requirement.
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: pkg.name === 'admin-boilerplate' ? 'Admin Boilerplate' : pkg.name,
        short_name: 'Admin',
        description: 'React admin panel boilerplate',
        theme_color: '#2F5D62',
        background_color: '#F6F7F5',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
