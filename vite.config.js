// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        host: true,
        port: 5173,
    },
    test: {
        // the app reads window.location while loading (APIClient), so tests need a browser-like environment
        environment: 'jsdom',
    },
})
