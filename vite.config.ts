// vite.config.ts
// defineConfig from vitest/config knows the test section below as well
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import licenses from './scripts/licensesPlugin'
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
        // the open source packages in the build with their licenses, for the page /lizenzen
        licenses(),
        // service worker: keeps the built app available offline and updates itself in the background
        VitePWA({
            registerType: 'autoUpdate',
            // public/manifest.json stays as it is
            manifest: false,
            workbox: {
                // the app itself; recipes, travel folders and images come from the backend, see runtimeCaching.
                // Fonts: only the latin files (Inter, Fraunces); the other subsets are loaded online when a page needs them
                globPatterns: ['**/*.{js,css,html,ico,png}', '**/*-latin-wght-normal-*.woff2', 'manifest.json'],
                runtimeCaching: [
                    {
                        // the word lists of the games: loaded only when a game is opened, then kept for offline use
                        urlPattern: ({ url }) => url.pathname.startsWith('/games/') && url.pathname.endsWith('.json'),
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'games',
                            cacheableResponse: { statuses: [200] },
                        },
                    },
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
        // npm run coverage: a summary in the console, coverage/coverage-summary.json for the badge, coverage/index.html to look at,
        // coverage/lcov.info for the overview of the lines not tested (scripts/coverage-report.mjs)
        coverage: {
            provider: 'v8',
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts', 'src/types/**'],
            reporter: ['text-summary', 'json-summary', 'html', 'lcovonly'],
        },
    },
})
