import { useState, useCallback, useRef } from "react";

type CacheCategory = 'basic' | 'sensitive' | 'config';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  category: CacheCategory;
  accessCount: number;
  lastAccessed: number;
}

interface CategoryOptions {
  ttl: number; // Time to live em ms
  maxSize: number; // Tamanho máximo para essa categoria
  compressionRatio?: number; // Para cache adaptativo
}

interface CacheOptions {
  categories: Record<CacheCategory, CategoryOptions>;
  autoCleanupInterval?: number; // Limpeza automática em ms
  enableMetrics?: boolean; // Habilitar métricas de performance
}

const defaultOptions: CacheOptions = {
  categories: {
    basic: { ttl: 5 * 60 * 1000, maxSize: 50 }, // 5min, 50 items
    sensitive: { ttl: 1 * 60 * 1000, maxSize: 20 }, // 1min, 20 items  
    config: { ttl: 30 * 60 * 1000, maxSize: 10 } // 30min, 10 items
  },
  autoCleanupInterval: 2 * 60 * 1000, // 2 minutos
  enableMetrics: true
};

interface CacheMetrics {
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  categorySizes: Record<CacheCategory, number>;
  lastCleanup: number;
}

export const useOptimizedCacheWithCategories = <T>(options: Partial<CacheOptions> = {}) => {
  const mergedOptions = { ...defaultOptions, ...options };
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const metricsRef = useRef<CacheMetrics>({
    totalHits: 0,
    totalMisses: 0,
    hitRate: 0,
    categorySizes: { basic: 0, sensitive: 0, config: 0 },
    lastCleanup: Date.now()
  });
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>();

  const [cacheSize, setCacheSize] = useState(0);

  // Limpeza automática
  const scheduleCleanup = useCallback(() => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }

    cleanupTimeoutRef.current = setTimeout(() => {
      cleanup();
      scheduleCleanup(); // Reagendar
    }, mergedOptions.autoCleanupInterval);
  }, [mergedOptions.autoCleanupInterval]);

  const updateMetrics = useCallback((hit: boolean, category?: CacheCategory) => {
    if (!mergedOptions.enableMetrics) return;

    if (hit) {
      metricsRef.current.totalHits++;
    } else {
      metricsRef.current.totalMisses++;
    }

    const total = metricsRef.current.totalHits + metricsRef.current.totalMisses;
    metricsRef.current.hitRate = total > 0 ? metricsRef.current.totalHits / total : 0;

    // Atualizar tamanhos das categorias
    metricsRef.current.categorySizes = { basic: 0, sensitive: 0, config: 0 };
    for (const [, entry] of cacheRef.current) {
      metricsRef.current.categorySizes[entry.category]++;
    }
  }, [mergedOptions.enableMetrics]);

  const get = useCallback((key: string, category: CacheCategory = 'basic'): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      updateMetrics(false, category);
      return null;
    }
    
    const now = Date.now();
    
    // Verificar se expirou
    if (now > entry.expiresAt) {
      cacheRef.current.delete(key);
      setCacheSize(cacheRef.current.size);
      updateMetrics(false, category);
      return null;
    }
    
    // Atualizar estatísticas de acesso
    entry.accessCount++;
    entry.lastAccessed = now;
    updateMetrics(true, category);
    
    return entry.data;
  }, [updateMetrics]);

  const set = useCallback((key: string, data: T, category: CacheCategory = 'basic'): void => {
    const now = Date.now();
    const categoryOptions = mergedOptions.categories[category];
    
    // Verificar limite da categoria
    const categoryCount = Array.from(cacheRef.current.values())
      .filter(entry => entry.category === category).length;
    
    if (categoryCount >= categoryOptions.maxSize && !cacheRef.current.has(key)) {
      // Remover entrada mais antiga da mesma categoria
      let oldestTime = now;
      let oldestKey = '';
      
      for (const [entryKey, entry] of cacheRef.current) {
        if (entry.category === category && entry.lastAccessed < oldestTime) {
          oldestTime = entry.lastAccessed;
          oldestKey = entryKey;
        }
      }
      
      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
      }
    }
    
    cacheRef.current.set(key, {
      data,
      timestamp: now,
      expiresAt: now + categoryOptions.ttl,
      category,
      accessCount: 1,
      lastAccessed: now
    });
    
    setCacheSize(cacheRef.current.size);
    updateMetrics(true, category);
    
    // Agendar limpeza se não estiver agendada
    if (!cleanupTimeoutRef.current) {
      scheduleCleanup();
    }
  }, [mergedOptions.categories, updateMetrics, scheduleCleanup]);

  const remove = useCallback((key: string): void => {
    const entry = cacheRef.current.get(key);
    cacheRef.current.delete(key);
    setCacheSize(cacheRef.current.size);
    
    if (entry) {
      updateMetrics(false, entry.category);
    }
  }, [updateMetrics]);

  const clear = useCallback((category?: CacheCategory): void => {
    if (category) {
      // Limpar apenas categoria específica
      for (const [key, entry] of cacheRef.current) {
        if (entry.category === category) {
          cacheRef.current.delete(key);
        }
      }
    } else {
      // Limpar tudo
      cacheRef.current.clear();
    }
    
    setCacheSize(cacheRef.current.size);
    updateMetrics(false);
  }, [updateMetrics]);

  const cleanup = useCallback((): number => {
    const now = Date.now();
    let removedCount = 0;
    
    for (const [key, entry] of cacheRef.current.entries()) {
      if (now > entry.expiresAt) {
        cacheRef.current.delete(key);
        removedCount++;
      }
    }
    
    setCacheSize(cacheRef.current.size);
    metricsRef.current.lastCleanup = now;
    
    return removedCount;
  }, []);

  const invalidateByPattern = useCallback((pattern: RegExp, category?: CacheCategory): number => {
    let invalidatedCount = 0;
    
    for (const [key, entry] of cacheRef.current.entries()) {
      if (pattern.test(key) && (!category || entry.category === category)) {
        cacheRef.current.delete(key);
        invalidatedCount++;
      }
    }
    
    setCacheSize(cacheRef.current.size);
    return invalidatedCount;
  }, []);

  // Cache com invalidação automática baseada em mudanças
  const getCached = useCallback(async <TResult>(
    key: string,
    fetcher: () => Promise<TResult>,
    category: CacheCategory = 'basic',
    forceRefresh: boolean = false
  ): Promise<TResult> => {
    if (!forceRefresh) {
      const cached = get(key, category) as unknown as TResult | null;
      if (cached !== null) {
        return cached;
      }
    }
    
    const result = await fetcher();
    set(key, result as unknown as T, category);
    return result;
  }, [get, set]);

  // Warming do cache para dados frequentes
  const warmCache = useCallback(async (
    warmingData: Array<{ key: string; fetcher: () => Promise<T>; category?: CacheCategory }>
  ): Promise<void> => {
    const promises = warmingData.map(async ({ key, fetcher, category = 'basic' }) => {
      try {
        const data = await fetcher();
        set(key, data, category);
      } catch (error) {
        console.error(`Erro ao aquecer cache para ${key}:`, error);
      }
    });
    
    await Promise.allSettled(promises);
  }, [set]);

  const getMetrics = useCallback((): CacheMetrics => {
    return { ...metricsRef.current };
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    return entry ? Date.now() <= entry.expiresAt : false;
  }, []);

  return {
    get,
    set,
    remove,
    clear,
    cleanup,
    invalidateByPattern,
    getCached,
    warmCache,
    has,
    cacheSize,
    getMetrics,
    
    // Helpers específicos por categoria
    setBasic: (key: string, data: T) => set(key, data, 'basic'),
    setSensitive: (key: string, data: T) => set(key, data, 'sensitive'),
    setConfig: (key: string, data: T) => set(key, data, 'config'),
    
    getBasic: (key: string) => get(key, 'basic'),
    getSensitive: (key: string) => get(key, 'sensitive'),
    getConfig: (key: string) => get(key, 'config'),
    
    clearBasic: () => clear('basic'),
    clearSensitive: () => clear('sensitive'),
    clearConfig: () => clear('config')
  };
};