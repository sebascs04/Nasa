import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/', 
  server: {
    proxy: {
      // Cualquier petición a '/api' será redirigida
      '/api': {
        // La URL del servidor de la NASA
        target: 'https://exoplanetarchive.ipac.caltech.edu',
        // Esto es necesario para que el servidor de la NASA acepte la petición
        changeOrigin: true,
        // Reescribimos la URL para quitar '/api' antes de enviarla
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

