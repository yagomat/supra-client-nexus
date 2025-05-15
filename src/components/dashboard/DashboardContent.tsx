
import { ClientEvolutionChart } from "./ClientEvolutionChart";
import { StatsCards } from "./StatsCards";
import { DistributionCharts } from "./DistributionCharts";
import { DashboardStats } from "@/types";

interface DashboardContentProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const DashboardContent = ({ stats, loading }: DashboardContentProps) => {
  // Safe getter function to handle potential null values
  const getSafeData = (dataArray: any[] | null | undefined, defaultValue: any[] = []) => {
    return Array.isArray(dataArray) ? dataArray : defaultValue;
  };

  // Create a safe version of evolution data
  const safeEvolucaoClientes = stats?.evolucao_clientes ? getSafeData(stats.evolucao_clientes) : [];

  return (
    <div className="flex flex-col space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">
        Bem-vindo ao seu painel de gestão de clientes. Aqui você encontra um resumo das suas estatísticas.
      </p>

      <StatsCards stats={stats} loading={loading} />

      <div className="grid gap-4 md:grid-cols-2">
        <ClientEvolutionChart data={safeEvolucaoClientes} loading={loading} />
        <DistributionCharts stats={stats} loading={loading} />
      </div>
    </div>
  );
};
