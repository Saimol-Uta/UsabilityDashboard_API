import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 5000, // Asegúrate de que coincida con el puerto del túnel
        allowedHosts: true, // Esto quita el bloqueo de Cloudflare
        proxy: {
            '/api': {
                target: 'http://localhost:5062',
                changeOrigin: true,
            },
        },
    },
})