import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  envPrefix: ['VITE_', 'API_'],
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3400',
      '/health': 'http://localhost:3400',
    },
  },
  preview: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3400',
      '/health': 'http://localhost:3400',
    },
  },
})
