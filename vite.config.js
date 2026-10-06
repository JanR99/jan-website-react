// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
        // service worker: keeps the built app available offline and updates itself in the background
        VitePWA({
            registerType: 'autoUpdate',
            // public/manifest.json stays as it is
            manifest: false,
            workbox: {
                // the app itself, without the travel photos in public/Bilder
                globPatterns: ['**/*.{js,css,html,ico,png,woff2}', 'manifest.json'],
            },
        }),
    ],
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
