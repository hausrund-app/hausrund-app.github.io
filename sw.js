// Hausrund Service Worker: Push-Benachrichtigungen und App-Shell für das Lesen ohne Netz (4Q21).
// In den Cache kommen NUR die App-Shell (index.html) und statische Dateien des Builds (JS, Schriften, Symbole).
// API-Antworten (Supabase, Dateien, Funktionen) laufen nie durch diesen Cache – personenbezogene Daten liegen hier nicht.
// Version und Dateiliste setzt scripts/pwa.js beim Build ein; ohne Build (Entwicklung) wird nichts gecacht.
const VERSION = "11d2ea69003c3f1a";
const DATEIEN = ["/_expo/static/js/web/entry-ac6fd636fcfbd46f88253dd61f6fbffc.js","/assets/node_modules/@expo-google-fonts/bricolage-grotesque/500Medium/BricolageGrotesque_500Medium.1363130c7bdf956d164cb7e605619849.ttf","/assets/node_modules/@expo-google-fonts/bricolage-grotesque/600SemiBold/BricolageGrotesque_600SemiBold.e5b5fc505484ff3ca24da73cba67c660.ttf","/assets/node_modules/@expo-google-fonts/bricolage-grotesque/700Bold/BricolageGrotesque_700Bold.2f7de7a336f650f9cee5ed919cc3b003.ttf","/assets/node_modules/@expo-google-fonts/bricolage-grotesque/800ExtraBold/BricolageGrotesque_800ExtraBold.5bfb4fa1f8907c768231d97bc27e8df9.ttf","/assets/node_modules/@expo-google-fonts/nunito-sans/400Regular/NunitoSans_400Regular.9a446df4acd337a0803b98608aab1e66.ttf","/assets/node_modules/@expo-google-fonts/nunito-sans/500Medium/NunitoSans_500Medium.fbd0884ddc5d2f3099b41283cc8f2f7d.ttf","/assets/node_modules/@expo-google-fonts/nunito-sans/600SemiBold/NunitoSans_600SemiBold.58a08cfbaf11a92ef3aaf80e768a16ad.ttf","/assets/node_modules/@expo-google-fonts/nunito-sans/700Bold/NunitoSans_700Bold.d16d2c478d30947f35321066f798de6c.ttf","/assets/node_modules/@expo-google-fonts/nunito-sans/800ExtraBold/NunitoSans_800ExtraBold.08d068a6a911ec141fac7d6886d83817.ttf","/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","/assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","/assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","/assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","/assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","/assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","/assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","/assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","/assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","/favicon.ico","/icons/apple-touch-icon.png","/icons/icon-192.png","/icons/icon-512.png","/icons/icon-maskable-512.png","/manifest.webmanifest"];
const PRAEFIX = 'hausrund-shell-';
const CACHE = PRAEFIX + VERSION;
const AKTIV = !VERSION.startsWith('__');

self.addEventListener('install', (e) => {
  self.skipWaiting();
  if (!AKTIV) return;
  // Einzeln laden: eine fehlende Datei verhindert nicht die ganze Installation
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(['/', ...DATEIEN].map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => undefined)))));
});

self.addEventListener('activate', (e) => {
  // Alte Builds (und alles andere mit unserem Präfix) löschen – es läuft immer nur der aktuelle Stand
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith(PRAEFIX) && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  // Abmelden: die App bittet, alles zu löschen (sie löscht die Caches zusätzlich selbst)
  if (e.data && e.data.typ === 'cache-leeren') e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith(PRAEFIX)).map((k) => caches.delete(k)))));
});

const STATISCH = new Set(DATEIEN);

self.addEventListener('fetch', (e) => {
  if (!AKTIV) return;
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  // Fremde Adressen (Supabase-API, Speicher, Push-Dienste) nie anfassen
  if (url.origin !== self.location.origin) return;
  if (r.mode === 'navigate') {
    // Seite: immer zuerst das Netz (nie eine veraltete App, solange Netz da ist); ohne Netz die App-Shell
    // Die App-Shell ist für jede Adresse dieselbe statische index.html (ohne Daten) – nach dem Abmelden füllt sie sich so wieder
    e.respondWith(
      fetch(r)
        .then((antwort) => {
          if (antwort.ok && antwort.type === 'basic' && !antwort.redirected) { const kopie = antwort.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put('/', kopie))); }
          return antwort;
        })
        .catch(async () => (await caches.match('/', { cacheName: CACHE })) ?? Response.error()),
    );
    return;
  }
  // Nur die Dateien des Builds aus dem Cache – alles andere geht unverändert ans Netz und wird nicht gespeichert
  if (!STATISCH.has(url.pathname)) return;
  e.respondWith(
    caches.match(url.pathname, { cacheName: CACHE }).then(
      (t) =>
        t ??
        fetch(r).then((antwort) => {
          if (antwort.ok) { const kopie = antwort.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put(url.pathname, kopie))); }
          return antwort;
        }),
    ),
  );
});

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
