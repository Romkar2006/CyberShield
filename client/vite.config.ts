import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'CyberShield Intelligence Hub',
        short_name: 'CyberShield',
        description: 'National AI-Powered Cybercrime Intelligence Platform',
        theme_color: '#00D4FF',
        background_color: '#0A0F1E',
        display: 'standalone',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('globe.gl') || id.includes('three') || id.includes('react-force-graph')) {
              return 'vendor-viz';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('recharts')) {
              return 'vendor-ui';
            }
            return 'vendor'; 
          }
        }
      }
    }
  }
})

