import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [cloudflare(), tailwindcss(), react()],
  resolve: {
    tsconfigPaths: true,
  },
})
