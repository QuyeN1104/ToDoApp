import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    server: {
      proxy: {
        // Frontend calls to '/api' are proxied to FastAPI during dev
        '/api': {
          target: process.env.BACKEND_URL || 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
          // Optionally rewrite if backend doesn't prefix '/api'
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    // Allow using VITE_API_URL for production deployment
    define: {
      'import.meta.env.VITE_APP_MODE': JSON.stringify(mode),
    },
  }
})
