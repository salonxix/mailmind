/**
 * Client-side caching utilities for AI results
 * Reduces API calls and improves performance
 */

const CACHE_VERSION = "v1";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

/**
 * Save data to localStorage with timestamp
 */
export function saveToCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.warn("Failed to save to cache:", error);
  }
}

/**
 * Load data from localStorage with TTL check
 */
export function loadFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const entry: CacheEntry<T> = JSON.parse(item);

    // Check version
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn("Failed to load from cache:", error);
    return null;
  }
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  if (typeof window === "undefined") return;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (
        key.startsWith("aiPriority_") ||
        key.startsWith("aiCategory_") ||
        key.startsWith("aiSpam_") ||
        key.startsWith("aiDeadline_") ||
        key.startsWith("aiTodoTitle_")
      ) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn("Failed to clear cache:", error);
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalItems: number;
  totalSize: number;
  oldestItem: number | null;
} {
  if (typeof window === "undefined") {
    return { totalItems: 0, totalSize: 0, oldestItem: null };
  }

  let totalItems = 0;
  let totalSize = 0;
  let oldestTimestamp: number | null = null;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("ai")) {
        totalItems++;
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;

          try {
            const entry = JSON.parse(item);
            if (
              !oldestTimestamp ||
              entry.timestamp < oldestTimestamp
            ) {
              oldestTimestamp = entry.timestamp;
            }
          } catch {
            // Skip invalid entries
          }
        }
      }
    });
  } catch (error) {
    console.warn("Failed to get cache stats:", error);
  }

  return {
    totalItems,
    totalSize,
    oldestItem: oldestTimestamp,
  };
}

/**
 * Clean up expired cache entries
 */
export function cleanupExpiredCache(): number {
  if (typeof window === "undefined") return 0;

  let cleaned = 0;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("ai")) {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const entry = JSON.parse(item);
            if (Date.now() - entry.timestamp > CACHE_TTL) {
              localStorage.removeItem(key);
              cleaned++;
            }
          } catch {
            // Remove invalid entries
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      }
    });
  } catch (error) {
    console.warn("Failed to cleanup cache:", error);
  }

  return cleaned;
}

/**
 * Batch save multiple cache entries
 */
export function batchSaveToCache<T>(
  entries: Array<{ key: string; data: T }>
): void {
  entries.forEach(({ key, data }) => {
    saveToCache(key, data);
  });
}

/**
 * Batch load multiple cache entries
 */
export function batchLoadFromCache<T>(
  keys: string[]
): Map<string, T> {
  const results = new Map<string, T>();

  keys.forEach((key) => {
    const data = loadFromCache<T>(key);
    if (data !== null) {
      results.set(key, data);
    }
  });

  return results;
}
