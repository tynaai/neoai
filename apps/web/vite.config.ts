import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import react from '@vitejs/plugin-react'

const apiService =
  process.env.CLOUDFLARE_ENV === 'production'
    ? 'neoai-api-production'
    : 'neoai-api'

export default defineConfig({
  plugins: [
    cloudflare({
      config: {
        services: [{ binding: 'API', service: apiService }],
      },
    }),
    tailwindcss(),
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
})
