const CACHE_NAME = 'pawpal-static-cache-v14';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './about.html',
  './volunteer.html',
  './dashboard.html',
  './impact.html',
  './manifest.json',
  './assets/images/Logo.png',
  './assets/images/A%20simple%20guide%20to%20report%20strays%20effectively.png',
  './assets/images/Join%20us%20in%20making%20a%20difference%20for%20strays.png',
  './assets/images/Every%20action%20you%20take%20counts%20toward%20change.png',
  './assets/images/about-rescue-impact.jpg',
  './assets/images/hero-mixed-animals.jpg',
  './assets/images/success-stories-split.jpg',
  './assets/images/volunteer-community.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Lora:ital,wght@0,600;1,600&family=Outfit:wght@700;800;900&display=swap',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching static assets');
        return Promise.all(
          ASSETS_TO_CACHE.map(url => {
            const req = new Request(url, { redirect: 'follow' });
            return fetch(req)
              .then(resp => {
                if (resp && (resp.status === 200 || resp.status === 0)) {
                  return cache.put(req, resp);
                }
              })
              .catch(err => console.warn('Failed to pre-cache asset:', url, err));
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  if (!url.protocol.startsWith('http')) return;

  // 1. Navigation requests: Network-First falling back to Cache
  if (event.request.mode === 'navigate') {
    const url = new URL(event.request.url);
    let cacheUrl = event.request.url;
    // Map clean URLs (without extension) to their corresponding .html keys
    if (!url.pathname.split('/').pop().includes('.')) {
      if (url.pathname.endsWith('/')) {
        cacheUrl = new URL(url.pathname + 'index.html', url.origin).toString();
      } else {
        cacheUrl = new URL(url.pathname + '.html', url.origin).toString();
      }
    }

    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(cacheUrl, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline, check cache for the mapped key
          return caches.match(cacheUrl)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback to index.html if not found in cache
              return caches.match('./index.html') || caches.match('index.html');
            });
        })
    );
    return;
  }

  // 2. Other requests (CSS, JS, Images): Cache-First falling back to Network
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(err => {
            console.warn('[Service Worker] Asset fetch failed:', event.request.url, err);
            // Let the browser handle standard failure
          });
      })
  );
});

// Background BroadcastChannel to show system notification
try {
  const distressChannel = new BroadcastChannel('pawpal_distress_channel');
  distressChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'NEW_TICKET') {
      const signedTicket = event.data.ticket;
      const ticket = signedTicket.data;
      
      self.registration.showNotification('🚨 EMERGENCY DISPATCH: New Critical Case Reported!', {
        body: `Ticket #${ticket.id}: ${ticket.description}\nSeverity: ${ticket.severity.toUpperCase()} | Close shelter alerted.`,
        icon: './assets/images/about-rescue-impact.jpg',
        badge: './assets/images/about-rescue-impact.jpg',
        data: { url: './dashboard.html' }
      });
    }
  };
} catch (bcErr) {
  console.warn("Service Worker BroadcastChannel initialization skipped:", bcErr);
}

// Handle notification click to open or focus the dashboard
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url.indexOf('dashboard.html') !== -1 && 'focus' in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow('./dashboard.html');
        }
      })
  );
});

