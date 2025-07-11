
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCacheOptimized } from "@/hooks/useCacheOptimized";
import { handleError } from "@/utils/errorHandler";

interface ChartDashboardData {
  evolucao_clientes: Array<{ mes: string; quantidade: number }>;
  distribuicao_dispositivos: Array<{ dispositivo: string; quantidade: number }>;
  distribuicao_aplicativos: Array<{ aplicativo: string; quantidade: number }>;
  distribuicao_ufs: Array<{ uf: string; quantidade: number }>;
  distribuicao_servidores: Array<{ servidor: string; quantidade: number }>;
  pagamentos_por_mes: Array<{ mes: string; valor: number }>;
}

export const useDashboardChartData = () => {
  const { user } = useAuth();
  const [data, setData] = useState<ChartDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cache para gráficos com TTL maior (10 minutos - aumentado)
  const cache = useCacheOptimized<ChartDashboardData>({ ttl: 10 * 60 * 1000 });

  const fetchChartData = useCallback(async (forceRefresh: boolean = false) => {
    if (!user?.id) return;

    const cacheKey = `dashboard_charts_${user.id}`;
    
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
      const { data: result, error } = await supabase.rpc('get_dashboard_chart_data', {
        user_id_param: user.id
      });

      if (error) {
        if (error.message.includes('Rate limit exceeded')) {
          setError("Carregando gráficos. Aguarde um momento...");
          // Retry after 5 seconds for chart data
          setTimeout(() => {
            fetchChartData(false);
          }, 5000);
          return;
        } else {
          throw error;
        }
      }

      const chartData = result as unknown as ChartDashboardData;
      setData(chartData);
      cache.set(cacheKey, chartData);
    } catch (err) {
      const errorMessage = handleError(err, "Erro ao carregar dados dos gráficos");
      console.error("Erro ao carregar dados dos gráficos:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, cache]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const refresh = useCallback(async () => {
    await fetchChartData(true);
  }, [fetchChartData]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache: () => cache.clear()
  };
};
