/*
 * Service worker do app Royal Marine (PWA).
 * - Guarda no aparelho só os arquivos do próprio site, para abrir mais rápido e funcionar sem internet.
 * - NÃO guarda dados pessoais e NÃO intercepta outros sites (previsão, mapas, WhatsApp, Google).
 * - Para forçar todos a receberem uma versão nova do cache, aumente o número de VERSION.
 */
const VERSION = 'v1'
const CACHE = `royal-marine-${VERSION}`
const PRECACHE = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  // Só cuida de arquivos do próprio site
  if (url.origin !== self.location.origin) return

  // Páginas: tenta a internet primeiro (conteúdo sempre atualizado); sem internet, abre a última versão salva
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('/', copy))
          return response
        })
        .catch(() => caches.match('/').then((cached) => cached || Response.error())),
    )
    return
  }

  // Arquivos do site com nome único (/assets/...): usa o salvo, senão baixa e guarda
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(CACHE).then((cache) => cache.put(request, copy))
            }
            return response
          }),
      ),
    )
    return
  }

  // Imagens e ícones: mostra o salvo na hora e atualiza em segundo plano
  if (url.pathname.startsWith('/images/') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const network = fetch(request)
            .then((response) => {
              if (response.ok) cache.put(request, response.clone())
              return response
            })
            .catch(() => cached)
          return cached || network
        }),
      ),
    )
  }
})
