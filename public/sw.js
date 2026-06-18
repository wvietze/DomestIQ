// DomestIQ Service Worker — Push Notifications + Offline Cache

const CACHE_NAME = 'domestiq-v4'
// Pre-cache only the offline shell + PWA assets. Never pre-cache '/' (the HTML
// document) so we can't serve a stale page that references deleted JS chunks.
const STATIC_ASSETS = ['/offline', '/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png']

// Install — cache the offline shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — drop every previous cache version
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch strategy.
//
// The previous version intercepted EVERY GET and cache.put() it — including
// cross-origin requests (Google Fonts, Maps) and Supabase REST data. Caching
// opaque/cross-origin responses made the Material Symbols font fail to load
// (icons rendered as literal text) and risked serving stale data and stale HTML
// that pointed at deleted build chunks.
//
// This version only ever touches SAME-ORIGIN, non-API GETs, and never caches
// HTML documents.
self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Let the browser handle everything cross-origin natively (fonts, maps,
  // Supabase) — we must not cache or proxy those.
  if (url.origin !== self.location.origin) return

  // Never touch API traffic.
  if (url.pathname.startsWith('/api/')) return

  // HTML navigations: network-only, with an offline fallback. We never cache the
  // document, so a returning user always gets HTML that matches the current
  // deployment's chunks.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline')))
    return
  }

  // Same-origin static assets (hashed /_next assets, images, icons, fonts):
  // stale-while-revalidate. Only basic (same-origin, non-opaque) 200 responses
  // are ever stored.
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request)
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            cache.put(request, response.clone())
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    })
  )
})

// Push notification received
self.addEventListener('push', (event) => {
  let data = { title: 'DomestIQ', body: 'You have a new notification', url: '/' }
  try {
    data = event.data.json()
  } catch {
    // use defaults
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
    actions: data.actions || [],
    tag: data.tag || 'domestiq-notification',
    renotify: true,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window or open new
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})
