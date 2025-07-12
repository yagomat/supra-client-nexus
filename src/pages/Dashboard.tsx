
import { useMemo, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useDashboardCriticalData } from "@/hooks/dashboard/useDashboardCriticalData";
import { useDashboardChartData } from "@/hooks/dashboard/useDashboardChartData";
import { useDashboardVisualizationProcessor } from "@/hooks/dashboard/useDashboardVisualizationProcessor";
import { useToast } from "@/components/ui/use-toast";

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

  // Tratamento de erros simplificado
  useEffect(() => {
    if (criticalError || chartError) {
      toast({
        title: "Aviso",
        description: "Alguns dados do dashboard podem estar desatualizados",
        variant: "default",
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
