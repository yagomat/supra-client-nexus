
import { useState, useEffect } from "react";
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

  const getCachedData = (): CacheData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached) as CacheData;
        if (Date.now() - data.lastUpdated < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.error('Erro ao ler cache:', error);
    }
    return null;
  };

  const setCachedData = (data: Omit<CacheData, 'lastUpdated'>) => {
    try {
      const cacheData: CacheData = {
        ...data,
        lastUpdated: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      setCache(cacheData);
    } catch (error) {
      console.error('Erro ao salvar cache:', error);
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

      setCachedData({ servidores, aplicativos, dispositivos, ufs });
    } catch (error) {
      console.error('Erro ao buscar dados estáticos:', error);
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = () => {
    localStorage.removeItem(CACHE_KEY);
    setCache(null);
  };

  useEffect(() => {
    const cachedData = getCachedData();
    if (cachedData) {
      setCache(cachedData);
    } else {
      fetchStaticData();
    }
  }, []);

  return {
    cache,
    loading,
    refreshCache: fetchStaticData,
    invalidateCache
  };
};
