
import { DistributionPieChart } from "./DistributionPieChart";
import { DashboardStats } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface DistributionChartsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const DistributionCharts = ({ stats, loading }: DistributionChartsProps) => {
  const isMobile = useIsMobile();
  
  // Safe getter function to handle potential null values
  const getSafeData = (dataArray: any[] | null | undefined, defaultValue: any[] = []) => {
    return Array.isArray(dataArray) ? dataArray : defaultValue;
  };

  // Create safe versions of each data set
  const safeDispositivos = stats?.distribuicao_dispositivos ? getSafeData(stats.distribuicao_dispositivos) : [];
  const safeAplicativos = stats?.distribuicao_aplicativos ? getSafeData(stats.distribuicao_aplicativos) : [];
  const safeUfs = stats?.distribuicao_ufs ? getSafeData(stats.distribuicao_ufs) : [];
  const safeServidores = stats?.distribuicao_servidores ? getSafeData(stats.distribuicao_servidores) : [];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
      <DistributionPieChart
        title="Distribuição por Dispositivo"
        data={safeDispositivos}
        loading={loading}
        nameKey="dispositivo"
      />
      <DistributionPieChart
        title="Distribuição por Aplicativo"
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
