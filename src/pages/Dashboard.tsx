
import { useMemo, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useDashboardCriticalData } from "@/hooks/dashboard/useDashboardCriticalData";
import { useDashboardChartData } from "@/hooks/dashboard/useDashboardChartData";
import { useDashboardVisualizationProcessor } from "@/hooks/dashboard/useDashboardVisualizationProcessor";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { toast } = useToast();
  
  // Hooks separados para dados críticos e gráficos
  const { 
    data: criticalData, 
    loading: criticalLoading, 
    error: criticalError,
    refresh: refreshCritical 
  } = useDashboardCriticalData();

  const { 
    data: chartData, 
    loading: chartLoading, 
    error: chartError,
    refresh: refreshCharts 
  } = useDashboardChartData();

  // Usar refs para estabilizar as funções de refresh
  const refreshCriticalRef = useRef(refreshCritical);
  const refreshChartsRef = useRef(refreshCharts);
  
  // Atualizar refs quando as funções mudarem
  useEffect(() => {
    refreshCriticalRef.current = refreshCritical;
    refreshChartsRef.current = refreshCharts;
  }, [refreshCritical, refreshCharts]);

  // Combinar dados brutos
  const rawStats = useMemo(() => {
    if (!criticalData || !chartData) return null;
    
    return {
      ...criticalData,
      ...chartData
    };
  }, [criticalData, chartData]);

  // Processar dados para visualização no frontend
  const stats = useDashboardVisualizationProcessor(rawStats);

  const loading = criticalLoading || chartLoading;

  // Configurar atualizações em tempo real otimizadas (menos frequentes)
  useEffect(() => {
    let criticalTimeout: NodeJS.Timeout;
    let chartTimeout: NodeJS.Timeout;

    const debouncedCriticalUpdate = () => {
      if (criticalTimeout) clearTimeout(criticalTimeout);
      criticalTimeout = setTimeout(() => {
        refreshCriticalRef.current();
      }, 10000); // Aumentado para 10 segundos
    };

    const debouncedChartUpdate = () => {
      if (chartTimeout) clearTimeout(chartTimeout);
      chartTimeout = setTimeout(() => {
        refreshChartsRef.current();
      }, 15000); // Aumentado para 15 segundos
    };

    // Subscription para mudanças críticas (pagamentos) - menos frequente
    const criticalChannel = supabase
      .channel('dashboard-critical-updates-v2')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
        }, 
        debouncedCriticalUpdate
      )
      .subscribe();

    // Subscription para mudanças nos gráficos (clientes) - menos frequente
    const chartChannel = supabase
      .channel('dashboard-chart-updates-v2')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clientes',
        }, 
        debouncedChartUpdate
      )
      .subscribe();

    return () => {
      if (criticalTimeout) clearTimeout(criticalTimeout);
      if (chartTimeout) clearTimeout(chartTimeout);
      supabase.removeChannel(criticalChannel);
      supabase.removeChannel(chartChannel);
    };
  }, []); // Dependências vazias

  // Tratamento de erros - movido para useEffect para evitar loop
  useEffect(() => {
    if (criticalError || chartError) {
      toast({
        title: "Erro ao carregar o dashboard",
        description: criticalError || chartError || "Erro desconhecido",
        variant: "destructive",
      });
    }
  }, [criticalError, chartError, toast]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8 animate-fade-in">
        <div className="animate-slide-up">
          <DashboardContent stats={stats} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
