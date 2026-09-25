/* Momo Year 2 service worker — offline shell + static caching.
 *
 * Strategy:
 *  - Navigations: network-first, fall back to the cached shell (offline → app loads).
 *  - Same-origin hashed assets (js/css/webp/png): cache-first (they are
 *    content-addressed, so a cache hit is always the right version).
 *  - Google Fonts: cache-first (gstatic) / stale-while-revalidate (googleapis CSS).
 *  - /api/* and everything else: pass through untouched (never cache AI keys,
 *    cloud saves or leaderboard traffic).
 *
 * Bump VERSION whenever the precached shell set changes. */
const VERSION = 'v1'
const SHELL_CACHE = `momo-shell-${VERSION}`
const ASSET_CACHE = `momo-assets-${VERSION}`

const SHELL_URLS = [
  './',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './favicon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('momo-shell-') || k.startsWith('momo-assets-'))
            .filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)

  // Never touch API traffic (AI chat, cloudsave, leaderboard, OAuth).
  if (url.pathname.includes('/api/')) return

  // Offline-capable navigations: network-first with shell fallback.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(SHELL_CACHE).then((cache) => cache.put('./', copy))
          return res
        })
        .catch(() => caches.match('./').then((hit) => hit || Response.error())),
    )
    return
  }

  // Google Fonts stylesheet: stale-while-revalidate.
  if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(staleWhileRevalidate(req, ASSET_CACHE))
    return
  }

  // Font files + same-origin static assets: cache-first (immutable content).
  if (url.hostname === 'fonts.gstatic.com' || url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, ASSET_CACHE))
    return
  }
})

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(req)
  if (hit) return hit
  const res = await fetch(req)
  if (res.ok) cache.put(req, res.clone())
  return res
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(req)
  const network = fetch(req)
    .then((res) => {
      if (res.ok) cache.put(req, res.clone())
      return res
    })
    .catch(() => hit)
  return hit || network
}
