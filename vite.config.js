import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default {
    plugins: [react()],
    server: {
        port: 3000,

        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
            '/auth': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },        
    }
};