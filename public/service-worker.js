/**
 * Service Worker para notificaciones push
 */

self.addEventListener('push', function(event) {
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const title = data.title || 'ACT Reportes';
  const options = {
    body: data.body || 'Nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Si ya hay una ventana abierta, enfocarla
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  event.waitUntil(
    self.registration.pushManager
      .subscribe(event.oldSubscription.options)
      .then(function(subscription) {
        // Enviar nueva suscripción al servidor
        return fetch('/api/notifications/update-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      })
  );
});
