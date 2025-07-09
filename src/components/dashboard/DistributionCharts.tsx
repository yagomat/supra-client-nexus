
import { DistributionPieChart } from "./DistributionPieChart";
import { DashboardStats } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSafeDashboardData } from "@/utils/dashboardUtils";

interface DistributionChartsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const DistributionCharts = ({ stats, loading }: DistributionChartsProps) => {
  const isMobile = useIsMobile();
  
  const {
    safeDispositivos,
    safeAplicativos,
    safeUfs,
    safeServidores
  } = useSafeDashboardData(stats);

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
      <DistributionPieChart
        title="Distribuição por Dispositivo (Telas 1 e 2)"
        data={safeDispositivos}
        loading={loading}
        nameKey="dispositivo"
      />
      <DistributionPieChart
        title="Distribuição por Aplicativo (Telas 1 e 2)"
        data={safeAplicativos}
        loading={loading}
        nameKey="aplicativo"
      />
      <DistributionPieChart
        title="Distribuição por UF"
        data={safeUfs}
        loading={loading}
        nameKey="uf"
      />
      <DistributionPieChart
        title="Distribuição por Servidor"
        data={safeServidores}
        loading={loading}
        nameKey="servidor"
      />
    </div>
  );
};
