import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        outDir: 'dist-react/',
    },
    server: {
        port: 5123,
        strictPort: true,
    },
    resolve: {
        alias: {
            '@/game': path.resolve(__dirname, 'src/game'),
            '@/electron': path.resolve(__dirname, 'src/electron'),
            '@/types': path.resolve(__dirname, 'src/types'),
            '@': path.resolve(__dirname, 'src/client'),
        },
    },
});
