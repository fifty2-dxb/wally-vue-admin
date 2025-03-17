import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { ExpirationPlugin } from 'workbox-expiration'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'

// Precache static assets
precacheAndRoute(globalThis.__WB_MANIFEST)

// API routes caching strategy
registerRoute(
  /^https:\/\/dev-api\.wally\.ae\/.*$/,
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 86400,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
)

// Image caching strategy
registerRoute(
  /^https:\/\/wally-images-bucket-dev\.s3\.eu-central-1\.amazonaws\.com\/.*$/,
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 604800,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
)

// Service Worker installation
globalThis.addEventListener('install', () => {
  console.log('Service Worker installed')
  globalThis.skipWaiting()
})

// Service Worker activation
globalThis.addEventListener('activate', event => {
  console.log('Service Worker activated')
  event.waitUntil(
    Promise.all([
      globalThis.clients.claim(),
      caches.keys().then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(cacheName =>
              cacheName.startsWith('workbox-')
              && cacheName !== 'workbox-precache-v2-http://localhost:5173/',
            )
            .map(cacheName => caches.delete(cacheName)),
        ),
      ),
    ]),
  )
})
