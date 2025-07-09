
import { ClientEvolutionChart } from "./ClientEvolutionChart";
import { PaymentEvolutionChart } from "./PaymentEvolutionChart";
import { StatsCards } from "./StatsCards";
import { DistributionCharts } from "./DistributionCharts";
import { AlertCards } from "./AlertCards";
import { DashboardStats } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSafeDashboardData } from "@/utils/dashboardUtils";

interface DashboardContentProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const DashboardContent = ({ stats, loading }: DashboardContentProps) => {
  const isMobile = useIsMobile();
  
  const {
    safeEvolucaoClientes,
    safePagamentosPorMes,
    safeClientesInativos,
    safeAppsVencendo,
    safeClientesEmRiscoDetalhes
  } = useSafeDashboardData(stats);

  return (
    <div className="flex flex-col space-y-4 w-full">
      <StatsCards stats={stats} loading={loading} />

      {/* New alert cards */}
      <AlertCards 
        clientesInativos={safeClientesInativos}
        appsVencendo={safeAppsVencendo}
        clientesEmRiscoDetalhes={safeClientesEmRiscoDetalhes}
        loading={loading}
      />

      {/* Para desktop: gráficos lado a lado */}
      {!isMobile ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="w-full">
            <ClientEvolutionChart data={safeEvolucaoClientes} loading={loading} />
          </div>
          <div className="w-full">
            <PaymentEvolutionChart data={safePagamentosPorMes} loading={loading} />
          </div>
        </div>
      ) : (
        // Para mobile: gráficos empilhados
        <>
          <div className="w-full">
            <ClientEvolutionChart data={safeEvolucaoClientes} loading={loading} />
          </div>
          <div className="w-full">
            <PaymentEvolutionChart data={safePagamentosPorMes} loading={loading} />
          </div>
        </>
      )}

      <DistributionCharts stats={stats} loading={loading} />
    </div>
  );
};
