import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    strictPort: true,
  },
  define: {
    '__BUILD_DATE__': JSON.stringify(new Date().toLocaleString('en-GB', { timeZone: 'UTC' }) + ' UTC')
  }
})
