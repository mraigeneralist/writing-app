import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// PWA manifest/runtime caching is fully configured in Phase 7.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Loom',
        short_name: 'Loom',
        description: 'Capture ideas, organize notes, and write.',
        theme_color: '#FAF9F6',
        background_color: '#FAF9F6',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
