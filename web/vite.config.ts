import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Dev: Vite serves the React app on :5173 and proxies the API + socket.io to
// the backend on :7865. Prod: `vite build` emits the bundle into ../public so
// the backend can serve it as a static SPA (config.publicDir).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:7865',
      '/socket.io': {
        target: 'http://localhost:7865',
        ws: true,
      },
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../public'),
    emptyOutDir: true,
  },
})
