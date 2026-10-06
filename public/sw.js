const CACHE_NAME = 'focus-flight-v2'
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) return

  const isNavigation = event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')

  if (isNavigation) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' })
        .then((response) => {
          if (response.ok) {
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put('/', response.clone())))
          }
          return response
        })
        .catch(() => caches.match('/')),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone())))
          }
          return response
        })
        .catch(() => caches.match('/'))
    }),
  )
})
