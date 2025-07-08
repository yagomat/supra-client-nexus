import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCacheOptimized } from "@/hooks/useCacheOptimized";

interface DashboardStats {
  clientes_ativos: number;
  clientes_inativos: number;
  clientes_novos: number;
  clientes_total: number;
  pagamentos_pendentes: number;
  valor_recebido_mes: number;
  evolucao_clientes: Array<{ mes: string; quantidade: number }>;
  distribuicao_dispositivos: Array<{ dispositivo: string; quantidade: number }>;
  distribuicao_aplicativos: Array<{ aplicativo: string; quantidade: number }>;
  distribuicao_ufs: Array<{ uf: string; quantidade: number }>;
  distribuicao_servidores: Array<{ servidor: string; quantidade: number }>;
  pagamentos_por_mes: Array<{ mes: string; valor: number }>;
  clientes_inativos_proximos_dias: number;
  apps_vencendo_proximos_dias: Array<any>;
  clientes_em_risco_detalhes: Array<any>;
}

export const useDashboardData = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cache = useCacheOptimized<DashboardStats>({ ttl: 2 * 60 * 1000 }); // 2 minutos

  const fetchDashboardStats = useCallback(async (forceRefresh: boolean = false) => {
    if (!user?.id) return;

    const cacheKey = `dashboard_stats_${user.id}`;
    
    // Verificar cache se não for refresh forçado
    if (!forceRefresh) {
      const cachedStats = cache.get(cacheKey);
      if (cachedStats) {
        setStats(cachedStats);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        user_id_param: user.id
      });

      if (error) {
        throw error;
      }

      const processedStats = data as unknown as DashboardStats;
      setStats(processedStats);
      cache.set(cacheKey, processedStats);
      console.log("Dashboard stats processados:", data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
      setError("Erro ao carregar estatísticas do dashboard");
    } finally {
      setLoading(false);
    }
  }, [user?.id, cache]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Memoizar dados processados para evitar recálculos desnecessários
  const processedStats = useMemo(() => {
    if (!stats) return null;

    return {
      ...stats,
      // Garantir que arrays existam
      evolucao_clientes: stats.evolucao_clientes || [],
      distribuicao_dispositivos: stats.distribuicao_dispositivos || [],
      distribuicao_aplicativos: stats.distribuicao_aplicativos || [],
      distribuicao_ufs: stats.distribuicao_ufs || [],
      distribuicao_servidores: stats.distribuicao_servidores || [],
      pagamentos_por_mes: stats.pagamentos_por_mes || [],
      apps_vencendo_proximos_dias: stats.apps_vencendo_proximos_dias || [],
      clientes_em_risco_detalhes: stats.clientes_em_risco_detalhes || [],
    };
  }, [stats]);

  const refresh = useCallback(async () => {
    await fetchDashboardStats(true);
  }, [fetchDashboardStats]);

  return {
    stats: processedStats,
    loading,
    error,
    refresh,
    clearCache: () => cache.clear()
  };
};