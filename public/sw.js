const CACHE_NAME = "note-app-shell-v2";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/favicon.svg"];

function isCacheableAsset(requestUrl, destination) {
  return (
    requestUrl.origin === self.location.origin &&
    ["script", "style", "image", "font", "worker"].includes(destination)
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  globalThis.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => globalThis.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.origin && event.origin !== globalThis.location.origin) {
    return;
  }

  if (!event.source || !("url" in event.source)) {
    return;
  }

  const sourceUrl = new URL(event.source.url);
  if (sourceUrl.origin !== globalThis.location.origin) {
    return;
  }

  if (event.data?.type === "SKIP_WAITING") {
    globalThis.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET") {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }

  event.respondWith(
    (async () => {
      if (isCacheableAsset(requestUrl, request.destination)) {
        const cached = await caches.match(request);
        if (cached) {
          // Refresh asset cache in the background while keeping responses fast.
          void fetch(request)
            .then((networkResponse) => {
              if (networkResponse?.ok) {
                return caches
                  .open(CACHE_NAME)
                  .then((cache) => cache.put(request, networkResponse.clone()));
              }
            })
            .catch(() => {
              // Ignore background refresh failures.
            });
          return cached;
        }
      }

      // Prefer fresh data for all other requests to avoid stale content.
      try {
        const networkResponse = await fetch(request);

        if (
          networkResponse &&
          networkResponse.ok &&
          isCacheableAsset(requestUrl, request.destination)
        ) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch {
        const cached = await caches.match(request);
        return cached || caches.match("/index.html");
      }
    })(),
  );
});
