
import { useState, useEffect } from "react";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { CryptoStorage } from "@/utils/cryptoStorage";
import { logError } from "@/utils/errorHandler";
import { supabase } from "@/integrations/supabase/client";

interface CacheData {
  servidores: string[];
  aplicativos: string[];
  dispositivos: string[];
  ufs: string[];
  lastUpdated: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const CACHE_KEY = 'cliente_static_data';

export const useClienteCache = () => {
  const [cache, setCache] = useState<CacheData | null>(null);
  const [loading, setLoading] = useState(false);

  const getCachedData = async (): Promise<CacheData | null> => {
    try {
      const data = await CryptoStorage.getItem<CacheData>(CACHE_KEY);
      if (data && Date.now() - data.lastUpdated < CACHE_DURATION) {
        return data;
      }
    } catch (error) {
      logError(error, 'getCachedData');
    }
    return null;
  };

  const setCachedData = async (data: Omit<CacheData, 'lastUpdated'>) => {
    try {
      const cacheData: CacheData = {
        ...data,
        lastUpdated: Date.now()
      };
      await CryptoStorage.setItem(CACHE_KEY, cacheData);
      setCache(cacheData);
    } catch (error) {
      logError(error, 'setCachedData');
    }
  };

  const fetchStaticData = async () => {
    setLoading(true);
    try {
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('servidor, aplicativo, aplicativo_2, dispositivo_smart, dispositivo_smart_2, uf')
        .not('servidor', 'is', null);

      if (error) throw error;

      const servidores = [...new Set(clientes?.map(c => c.servidor).filter(Boolean) || [])];
      const aplicativos = [...new Set([
        ...(clientes?.map(c => c.aplicativo).filter(Boolean) || []),
        ...(clientes?.map(c => c.aplicativo_2).filter(Boolean) || [])
      ])];
      const dispositivos = [...new Set([
        ...(clientes?.map(c => c.dispositivo_smart).filter(Boolean) || []),
        ...(clientes?.map(c => c.dispositivo_smart_2).filter(Boolean) || [])
      ])];
      const ufs = [...new Set(clientes?.map(c => c.uf).filter(Boolean) || [])];

      await setCachedData({ servidores, aplicativos, dispositivos, ufs });
    } catch (error) {
      logError(error, 'fetchStaticData');
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = () => {
    CryptoStorage.removeItem(CACHE_KEY);
    setCache(null);
  };

  useEffect(() => {
    const loadCache = async () => {
      const cachedData = await getCachedData();
      if (cachedData) {
        setCache(cachedData);
      } else {
        fetchStaticData();
      }
    };
    
    loadCache();
  }, []);

  return {
    cache,
    loading,
    refreshCache: fetchStaticData,
    invalidateCache
  };
};
