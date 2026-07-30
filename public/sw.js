const CACHE_VERSION = 'v1'
const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`
const RUNTIME_CACHE = `pwa-runtime-${CACHE_VERSION}`

const APP_SHELL_URLS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== APP_SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/'))),
    )
    return
  }

  if (url.pathname.includes('/api/files/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
      }),
    )
    return
  }

  if (url.pathname.includes('/api/collections/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone()
              caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
            }
            return response
          })
          .catch(() => cached)
        return cached || fetchPromise
      }),
    )
    return
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone))
          }
          return response
        })
      }),
    )
  }
})
