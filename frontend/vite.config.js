
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// export default defineConfig({
//   plugins: [react(), tailwindcss()],
//   server: {
//     host: '0.0.0.0',
//     port: 5173,
//     proxy: {
//       '/api': {
//         target: 'http://127.0.0.1:8000',
//         changeOrigin: true,
//       },
//       '/health': {
//         target: 'http://127.0.0.1:8000',
//         changeOrigin: true,
//       },
//     },
//   },
// })
export default defineConfig(({ mode }) => {
  console.log('Build mode:', mode)
  console.log('API URL:', process.env.VITE_API_URL)

  return {
    plugins: [react(), tailwindcss()],
    // Keep your existing server configuration here
  }
})
