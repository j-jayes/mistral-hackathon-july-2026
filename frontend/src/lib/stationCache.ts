/**
 * IndexedDB caching utility for Velib station data
 * This allows the app to work offline and provides fast access to station data
 */

const DB_NAME = 'VelibParkingGuide';
const STORE_NAME = 'stations';
const CACHE_KEY = 'allStations';
const LAST_UPDATED_KEY = 'lastUpdated';

interface StationCacheData {
  stations: any[];
  lastUpdated: number;
}

class StationCache {
  private db: IDBDatabase | null = null;
  private initialized = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);

        request.onerror = () => {
          console.warn('IndexedDB not available, using in-memory cache');
          this.initialized = true;
          resolve();
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.initialized = true;
          resolve();
        };

        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
      });
    } catch (error) {
      console.warn('IndexedDB error:', error);
      this.initialized = true;
    }
  }

  private async _ready(): Promise<void> {
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Save stations to cache
   */
  async saveStations(stations: any[], lastUpdated: number = Date.now()): Promise<void> {
    await this._ready();

    if (!this.db) {
      // Fallback to localStorage
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(stations));
        localStorage.setItem(LAST_UPDATED_KEY, lastUpdated.toString());
        return;
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
        return;
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      store.put({ key: CACHE_KEY, value: stations }, CACHE_KEY);
      store.put({ key: LAST_UPDATED_KEY, value: lastUpdated }, LAST_UPDATED_KEY);
    });
  }

  /**
   * Load stations from cache
   */
  async loadStations(): Promise<{ stations: any[]; lastUpdated: number | null }> {
    await this._ready();

    if (!this.db) {
      // Try localStorage fallback
      try {
        const stations = localStorage.getItem(CACHE_KEY);
        const lastUpdated = localStorage.getItem(LAST_UPDATED_KEY);
        return {
          stations: stations ? JSON.parse(stations) : [],
          lastUpdated: lastUpdated ? parseInt(lastUpdated) : null
        };
      } catch (e) {
        console.warn('Failed to load from localStorage:', e);
        return { stations: [], lastUpdated: null };
      }
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => {
        resolve({ stations: [], lastUpdated: null });
      };

      const stationsRequest = store.get(CACHE_KEY);
      const updatedRequest = store.get(LAST_UPDATED_KEY);

      stationsRequest.onsuccess = () => {
        const stations = stationsRequest.result?.value || [];
        
        updatedRequest.onsuccess = () => {
          const lastUpdated = updatedRequest.result?.value || null;
          resolve({ stations, lastUpdated });
        };

        updatedRequest.onerror = () => {
          resolve({ stations, lastUpdated: null });
        };
      };

      stationsRequest.onerror = () => {
        resolve({ stations: [], lastUpdated: null });
      };
    });
  }

  /**
   * Clear cache
   */
  async clear(): Promise<void> {
    await this._ready();

    if (!this.db) {
      try {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(LAST_UPDATED_KEY);
        return;
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
        return;
      }
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      store.delete(CACHE_KEY);
      store.delete(LAST_UPDATED_KEY);
    });
  }

  /**
   * Get last updated timestamp
   */
  async getLastUpdated(): Promise<number | null> {
    const { lastUpdated } = await this.loadStations();
    return lastUpdated;
  }
}

// Singleton instance
export const stationCache = new StationCache();

export default stationCache;