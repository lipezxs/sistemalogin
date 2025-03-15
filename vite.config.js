import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default {
  server: {
    host: '0.0.0.0', // Escuta em todas as interfaces de rede
    port: process.env.PORT || 5173, // Usa a porta do Render ou 5173 como fallback
  },
};