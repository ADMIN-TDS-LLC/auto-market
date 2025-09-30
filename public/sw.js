// AutoMarket Service Worker - Versión mejorada sin errores
const CACHE_NAME = 'automarket-v1.2.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/512X512.jpc.jpg',
  '/firebase-config.js'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch((error) => {
        console.log('Service Worker: Error al cachear:', error);
      })
  );
  // Forzar activación inmediata
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control inmediato
  self.clients.claim();
});

// Función para validar si un request es cacheable
function isCacheableRequest(request) {
  // Solo cachear requests HTTP/HTTPS
  if (!request.url.startsWith('http')) return false;
  
  // No cachear extensiones de Chrome
  if (request.url.includes('chrome-extension')) return false;
  
  // No cachear data URLs
  if (request.url.startsWith('data:')) return false;
  
  // No cachear blob URLs
  if (request.url.startsWith('blob:')) return false;
  
  // Solo cachear GET requests
  if (request.method !== 'GET') return false;
  
  return true;
}

// Interceptar requests
self.addEventListener('fetch', (event) => {
  // Solo procesar requests cacheables
  if (!isCacheableRequest(event.request)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si está en cache, devolverlo
        if (response) {
          return response;
        }
        
        // Si no está en cache, hacer fetch
        return fetch(event.request).then((response) => {
          // Verificar si es una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Solo cachear si el request es válido
          if (isCacheableRequest(event.request)) {
            // Clonar la respuesta para el cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache).catch(error => {
                  console.log('Service Worker: Error al cachear:', error);
                });
              })
              .catch(error => {
                console.log('Service Worker: Error al abrir cache:', error);
              });
          }
          
          return response;
        });
      })
      .catch((error) => {
        console.log('Service Worker: Error en fetch:', error);
        // En caso de error, devolver página offline si existe
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Manejar mensajes del cliente de forma síncrona
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Responder inmediatamente para evitar el error de canal cerrado
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage({status: 'ok'});
  }
});

// Manejar errores sin bloquear
self.addEventListener('error', (event) => {
  console.log('Service Worker: Error capturado:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.log('Service Worker: Promise rechazada:', event.reason);
  event.preventDefault();
});