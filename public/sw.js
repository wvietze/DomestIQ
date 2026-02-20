// DomestIQ Service Worker — Push Notifications + Offline Cache

const CACHE_NAME = 'domestiq-v2'
const STATIC_ASSETS = ['/', '/offline', '/manifest.json', '/icons/icon-192x192.png', '/icons/icon-512x512.png']

// Install — cache static assets including offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network first, cache fallback
self.addEventListener('fetch', (event) => {
  // Only cache GET requests, skip API calls
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request).then((cached) => {
        if (cached) return cached
        // For navigation requests, show offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline')
        }
        return cached
      }))
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
