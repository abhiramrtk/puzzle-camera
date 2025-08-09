import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow network access
    https: false, // Set to true if you need HTTPS for camera testing
    port: 5173,
    open: false,
    cors: true,
    // Uncomment the following for HTTPS with self-signed certificate
    // This is needed for camera access from mobile devices over network
    // https: {
    //   key: undefined, // Vite will generate self-signed cert
    //   cert: undefined
    // }
  }
})
