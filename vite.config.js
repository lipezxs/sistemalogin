import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Escuta em todas as interfaces de rede
    port: process.env.PORT || 5173, // Usa a porta do ambiente ou 5173 como fallback
  },
  preview: {
    host: '0.0.0.0', // Escuta em todas as interfaces de rede
    port: process.env.PORT || 5173, // Porta para o comando `vite preview`
    allowedHosts: [
      'sistemalogin-l5e0.onrender.com', // Adicione o host permitido
    ],
  },
});