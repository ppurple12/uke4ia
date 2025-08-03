import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/images': {
        target: 'http://localhost:8000',  // your FastAPI backend URL
        changeOrigin: true,
        secure: false,
      },
      '/api': 'http://localhost:8000',
    },
  },
})
