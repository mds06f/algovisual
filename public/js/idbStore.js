// public/js/idbStore.js

const DB_NAME = 'algovisual-db';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('presets')) {
        db.createObjectStore('presets', { keyPath: 'name' });
      }

      if (!db.objectStoreNames.contains('sandbox')) {
        db.createObjectStore('sandbox', { keyPath: 'name' });
      }

      if (!db.objectStoreNames.contains('telemetry')) {
        db.createObjectStore('telemetry', { keyPath: 'timestamp' });
      }
    };
  });

  return dbPromise;
}

// ── Generic Promise Store Operations ─────────────────────────────────────────

export function writeToStore(storeName, data) {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  });
}

export function readFromStore(storeName, key) {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

export function readAllFromStore(storeName) {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  });
}

export function deleteFromStore(storeName, key) {
  return getDB().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  });
}
