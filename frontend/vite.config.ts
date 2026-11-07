import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/gateway': {
        target: 'http://127.0.0.1:18000',
        // Preserve host so session cookies and redirects work seamlessly with Switch Core
        changeOrigin: false,
      },
      '/health': {
        target: 'http://127.0.0.1:18000',
        changeOrigin: false,
      },
    },
  },
})
