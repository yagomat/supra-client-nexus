
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
  
  // Cache crítico com TTL de 3 minutos
  const cache = useCacheOptimized<CriticalDashboardData>({ ttl: 3 * 60 * 1000 });

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
      // Verificar rate limit primeiro
      const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
        p_user_id: user.id,
        p_operation: 'dashboard_request',
        p_max_requests: 30,
        p_time_window_minutes: 5
      });

      if (!rateLimitOk) {
        setError("Dashboard sendo carregado. Aguarde um momento...");
        setTimeout(() => {
          fetchCriticalData(false);
        }, 10000); // Retry após 10 segundos
        return;
      }

      const { data: result, error } = await supabase.rpc('get_dashboard_critical_stats', {
        user_id_param: user.id
      });

      if (error) {
        throw error;
      }

      const criticalData = result as unknown as CriticalDashboardData;
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
