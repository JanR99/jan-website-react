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
                runtimeCaching: [
                    {
                        // recipes and the API description: network first, the stored copy when the backend doesn't answer
                        urlPattern: ({ url }) => url.pathname === '/v3/api-docs' || url.pathname === '/api/recipes/list',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api',
                            networkTimeoutSeconds: 3,
                            cacheableResponse: { statuses: [200] },
                            plugins: [
                                {
                                    // a server error (e.g. 503 while Cloud Run is down) counts as "no answer"
                                    fetchDidSucceed: async ({ response }) => {
                                        if (response.status >= 500) throw new Error(`backend answered ${response.status}`)
                                        return response
                                    },
                                },
                            ],
                        },
                    },
                    {
                        // recipe images never change (a new upload gets a new id): stored once they were loaded
                        urlPattern: ({ url }) => url.pathname.startsWith('/api/images/'),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'recipe-images',
                            // <img> loads them without CORS, which would give the worker a response it can't check
                            fetchOptions: { mode: 'cors', credentials: 'omit' },
                            cacheableResponse: { statuses: [200] },
                            expiration: { maxEntries: 200, purgeOnQuotaError: true },
                        },
                    },
                    {
                        // preview images of the travel photos; the full-size ones are too big to store
                        urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.includes('/Bilder/Urlaub-thumbnail/'),
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'travel-thumbnails',
                            cacheableResponse: { statuses: [200] },
                            expiration: { maxEntries: 60, purgeOnQuotaError: true },
                        },
                    },
                ],
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
