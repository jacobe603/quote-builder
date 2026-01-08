import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/quote-builder/', // GitHub Pages serves from /<repo-name>/
})
