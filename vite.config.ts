import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // هذه النقطة هي أهم سطر، تجعل المسارات نسبية وتنهي مشكلة الشاشة السوداء
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
