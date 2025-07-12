
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCacheOptimized } from "@/hooks/useCacheOptimized";
import { handleError } from "@/utils/errorHandler";

interface CriticalDashboardData {
  clientes_ativos: number;
  clientes_inativos: number;
  clientes_novos: number;
  clientes_total: number;
  pagamentos_pendentes: number;
  valor_recebido_mes: number;
  clientes_inativos_proximos_dias: number;
  apps_vencendo_proximos_dias: Array<any>;
  clientes_em_risco_detalhes: Array<any>;
}

export const useDashboardCriticalData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<CriticalDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache crítico com TTL de 5 minutos
  const cache = useCacheOptimized<CriticalDashboardData>({ ttl: 5 * 60 * 1000 });

  const fetchCriticalData = useCallback(async (forceRefresh: boolean = false) => {
    if (!user?.id) return;

    const cacheKey = `dashboard_critical_${user.id}`;
    
    if (!forceRefresh) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Tentar usar a função RPC principal primeiro
      let result;
      let criticalData: CriticalDashboardData;

      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('get_dashboard_critical_stats', {
          user_id_param: user.id
        });

        if (rpcError) {
          throw rpcError;
        }

        criticalData = rpcResult as unknown as CriticalDashboardData;
      } catch (rpcError) {
        console.warn('RPC function failed, using fallback queries:', rpcError);
        
        // Fallback: queries manuais se a função RPC falhar
        const [
          { count: clientesAtivos },
          { count: clientesInativos },
          { count: clientesNovos }
        ] = await Promise.all([
          supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'ativo'),
          supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'inativo'),
          supabase
            .from('clientes')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        ]);

        criticalData = {
          clientes_ativos: clientesAtivos || 0,
          clientes_inativos: clientesInativos || 0,
          clientes_novos: clientesNovos || 0,
          clientes_total: (clientesAtivos || 0) + (clientesInativos || 0),
          pagamentos_pendentes: 0,
          valor_recebido_mes: 0,
          clientes_inativos_proximos_dias: 0,
          apps_vencendo_proximos_dias: [],
          clientes_em_risco_detalhes: []
        };
      }

      setData(criticalData);
      cache.set(cacheKey, criticalData);
    } catch (err) {
      const errorMessage = handleError(err, "Erro ao carregar dados críticos do dashboard");
      console.error("Erro ao carregar dados críticos:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, cache]);

  useEffect(() => {
    fetchCriticalData();
  }, [fetchCriticalData]);

  const refresh = useCallback(async () => {
    await fetchCriticalData(true);
  }, [fetchCriticalData]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache: () => cache.clear()
  };
};
