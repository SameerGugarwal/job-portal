import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /api requests to Express backend during development
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
      // Forward /uploads requests so images/resumes served by Express are accessible
      '/uploads': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
})
