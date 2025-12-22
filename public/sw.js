// Service Worker for Beer Cooling Timer PWA
// Handles push notifications when app is closed

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  let data = {
    title: 'Beer is Ready!',
    message: 'Your beer has reached the perfect temperature',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  const title = data.title || 'Beer is Ready!';
  const options = {
    body: data.message || 'Your beer has reached the perfect temperature!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'beer-timer',
    requireInteraction: true, // Keep notification visible until user interacts
    vibrate: [200, 100, 200], // Vibration pattern: vibrate 200ms, pause 100ms, vibrate 200ms
    data: {
      url: '/',
      timestamp: data.timestamp || Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
      },
      {
        action: 'close',
        title: 'Dismiss',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'close') {
    // User clicked dismiss
    return;
  }

  // Open the app (either focus existing window or open new one)
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // No existing window, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle messages from the main thread (optional, for future use)
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
