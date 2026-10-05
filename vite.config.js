import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // API_URL (the backend base URL) is read from .env files locally and from
  // the build environment on Vercel. It's injected explicitly because Vite
  // only passes VITE_-prefixed variables to browser code by default. The
  // value is not a secret - the browser has to know where to send requests -
  // so never inject real secrets this way.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      'import.meta.env.API_URL': JSON.stringify(env.API_URL ?? ''),
    },
  }
})
