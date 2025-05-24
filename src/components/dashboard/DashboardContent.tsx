
import { ClientEvolutionChart } from "./ClientEvolutionChart";
import { PaymentEvolutionChart } from "./PaymentEvolutionChart";
import { StatsCards } from "./StatsCards";
import { DistributionCharts } from "./DistributionCharts";
import { AlertCards } from "./AlertCards";
import { DashboardStats } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardContentProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const DashboardContent = ({ stats, loading }: DashboardContentProps) => {
  const isMobile = useIsMobile();
  
  // Safe getter function to handle potential null values
  const getSafeData = (dataArray: any[] | null | undefined, defaultValue: any[] = []) => {
    return Array.isArray(dataArray) ? dataArray : defaultValue;
  };

  // Create a safe version of evolution data
  const safeEvolucaoClientes = stats?.evolucao_clientes ? getSafeData(stats.evolucao_clientes) : [];
  
  // Create a safe version of payment evolution data
  const safePagamentosPorMes = stats?.pagamentos_por_mes ? getSafeData(stats.pagamentos_por_mes) : [];

  // Create safe versions of new alert data
  const safeClientesInativos = stats?.clientes_inativos_proximos_dias || 0;
  const safeClientesEmRiscoDetalhes = stats?.clientes_em_risco_detalhes ? getSafeData(stats.clientes_em_risco_detalhes) : [];
  const safeAppsVencendo = stats?.apps_vencendo_proximos_dias ? getSafeData(stats.apps_vencendo_proximos_dias) : [];

  return (
    <div className="flex flex-col space-y-4 w-full">
      <p className="text-muted-foreground">
        Bem-vindo ao seu painel de gestão de clientes. Aqui você encontra um resumo das suas estatísticas.
      </p>

      {/* Alert cards moved to the top of the dashboard */}
      <AlertCards 
        clientesInativos={safeClientesInativos}
        clientesEmRiscoDetalhes={safeClientesEmRiscoDetalhes}
        appsVencendo={safeAppsVencendo}
        loading={loading}
      />

      <StatsCards stats={stats} loading={loading} />

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
