// Hausrund Service Worker: nur Push-Benachrichtigungen, kein Offline-Cache (damit nie eine veraltete App läuft)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { titel: 'Hausrund', text: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.titel || 'Hausrund', {
    body: d.text || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: d.tag || undefined,
    data: { url: d.url || '/' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const ziel = new URL(e.notification.data?.url || '/', self.location.origin);
  // Nur eigene Adressen öffnen – nie fremde Links aus einer Benachrichtigung
  if (ziel.origin !== self.location.origin) return;
  e.waitUntil((async () => {
    const fenster = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const f of fenster) {
      if ('focus' in f) { await f.focus(); if ('navigate' in f) await f.navigate(ziel.href); return; }
    }
    await self.clients.openWindow(ziel.href);
  })());
});
