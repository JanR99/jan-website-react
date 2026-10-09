// vite.config.ts
// defineConfig from vitest/config knows the test section below as well
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// a server error (e.g. 503 while Cloud Run is down) counts as "no answer"
const serverErrorIsNoAnswer = {
    fetchDidSucceed: async ({ response }: { response: Response }) => {
        if (response.status >= 500) throw new Error(`backend answered ${response.status}`)
        return response
    },
}

export default defineConfig({
    plugins: [
        react(),
        // service worker: keeps the built app available offline and updates itself in the background
        VitePWA({
            registerType: 'autoUpdate',
            // public/manifest.json stays as it is
            manifest: false,
            workbox: {
                // the app itself; recipes, travel folders and images come from the backend, see runtimeCaching
                globPatterns: ['**/*.{js,css,html,ico,png,woff2}', 'manifest.json'],
                runtimeCaching: [
                    {
                        // the API description: network first, the stored copy when the backend doesn't answer within 3 seconds
                        urlPattern: ({ url }) => url.pathname === '/v3/api-docs',
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api',
                            networkTimeoutSeconds: 3,
                            cacheableResponse: { statuses: [200] },
                            plugins: [serverErrorIsNoAnswer],
                        },
                    },
                    {
                        // recipes and travel folders: network first, the stored copy when the backend can't be reached.
                        // No time limit: while the backend wakes up the pages show the stored copy themselves
                        // (storedThenFresh) and need the real answer from here, however long it takes.
                        urlPattern: ({ url }) => ['/api/recipes/list', '/api/travel/folders/list'].includes(url.pathname),
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api',
                            cacheableResponse: { statuses: [200] },
                            plugins: [serverErrorIsNoAnswer],
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
                        // travel photos never change either: stored once they were loaded, the oldest ones make room
                        urlPattern: ({ url }) => /^\/api\/travel\/photos\/\d+$/.test(url.pathname),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'travel-photos',
                            fetchOptions: { mode: 'cors', credentials: 'omit' },
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
            '@': path.resolve(import.meta.dirname, 'src'),
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
