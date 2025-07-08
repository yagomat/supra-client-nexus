import { useState, useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live em milliseconds
  maxSize?: number; // Tamanho máximo do cache
}

export const useCacheOptimized = <T>(options: CacheOptions = {}) => {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // 5 minutos padrão
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [cacheSize, setCacheSize] = useState(0);

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) return null;
    
    // Verificar se expirou
    if (Date.now() > entry.expiresAt) {
      cacheRef.current.delete(key);
      setCacheSize(cacheRef.current.size);
      return null;
    }
    
    return entry.data;
  }, []);

  const set = useCallback((key: string, data: T): void => {
    const now = Date.now();
    
    // Remover entrada mais antiga se exceder o tamanho máximo
    if (cacheRef.current.size >= maxSize && !cacheRef.current.has(key)) {
      const oldestKey = cacheRef.current.keys().next().value;
      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
      }
    }
    
    cacheRef.current.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
    
    setCacheSize(cacheRef.current.size);
  }, [ttl, maxSize]);

  const remove = useCallback((key: string): void => {
    cacheRef.current.delete(key);
    setCacheSize(cacheRef.current.size);
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
    setCacheSize(0);
  }, []);

  const cleanup = useCallback((): void => {
    const now = Date.now();
    for (const [key, entry] of cacheRef.current.entries()) {
      if (now > entry.expiresAt) {
        cacheRef.current.delete(key);
      }
    }
    setCacheSize(cacheRef.current.size);
  }, []);

  return {
    get,
    set,
    remove,
    clear,
    cleanup,
    cacheSize,
    has: (key: string) => cacheRef.current.has(key) && Date.now() <= cacheRef.current.get(key)!.expiresAt
  };
};