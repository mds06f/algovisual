// public/sw.js
const CACHE_NAME = 'algovisual-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/visualizer',
  '/css/style.css',
  '/js/player.js',
  '/js/graphRenderer.js',
  '/js/treeRenderer.js',
  '/js/astTranspiler.js',
  '/js/memoryProfiler.js',
  '/js/socketPlayer.js',
  '/js/idbStore.js',
  '/images/icon.svg',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/acorn/8.12.1/acorn.min.js',
  
  // Algorithms
  '/algorithms/aStar.js',
  '/algorithms/avlRedBlackTree.js',
  '/algorithms/binarySearch.js',
  '/algorithms/bstInsert.js',
  '/algorithms/bubbleSort.js',
  '/algorithms/countingSort.js',
  '/algorithms/dijkstra.js',
  '/algorithms/fibonacci.js',
  '/algorithms/graphOps.js',
  '/algorithms/heapSort.js',
  '/algorithms/insertionSort.js',
  '/algorithms/linearSearch.js',
  '/algorithms/matrixOps.js',
  '/algorithms/mergeSort.js',
  '/algorithms/minMaxFinder.js',
  '/algorithms/quickSort.js',
  '/algorithms/reverseArray.js',
  '/algorithms/selectionSort.js',
  '/algorithms/stackQueue.js'
];

// Install: Cache all static shell files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      // Use option to tolerate missing assets if any get removed or are test-only
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) => {
          return cache.add(asset).catch((err) => {
            console.warn(`[Service Worker] Failed to cache: ${asset}`, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // 1. Network-First strategy for dynamic page routes
  if (
    requestUrl.origin === self.location.origin &&
    (requestUrl.pathname === '/' ||
      requestUrl.pathname.startsWith('/visualizer') ||
      requestUrl.pathname.startsWith('/room'))
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. Cache-First strategy for static assets and CDN library scripts
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
