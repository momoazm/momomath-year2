import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: { port: 3200 },
  preview: { port: 3200 },
  test: {
    // Chest/card suite does heavy deterministic Monte-Carlo rolls (200k+ per
    // test). Give every test a generous ceiling so slow machines don't flake.
    testTimeout: 15000,
    hookTimeout: 15000,
  },
})