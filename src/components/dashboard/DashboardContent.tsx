
import { ClientEvolutionChart } from "./ClientEvolutionChart";
import { PaymentEvolutionChart } from "./PaymentEvolutionChart";
import { StatsCards } from "./StatsCards";
import { DistributionCharts } from "./DistributionCharts";
import { DashboardStats } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";

interface DashboardContentProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const DashboardContent = ({ stats, loading }: DashboardContentProps) => {
  const isMobile = useIsMobile();
  const [clientEvolutionData, setClientEvolutionData] = useState<Array<{ mes: string; quantidade: number }>>([]);
  
  // Safe getter function to handle potential null values
  const getSafeData = (dataArray: any[] | null | undefined, defaultValue: any[] = []) => {
    return Array.isArray(dataArray) ? dataArray : defaultValue;
  };
  
  // Create a safe version of payment evolution data
  const safePagamentosPorMes = stats?.pagamentos_por_mes ? getSafeData(stats.pagamentos_por_mes) : [];

  useEffect(() => {
    if (stats?.evolucao_clientes) {
      // Gerar todos os 12 meses
      const last12Months = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        // Format as "Mmm/YY" to match the format from the backend
        const formattedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1).replace('. ', '/');
        last12Months.push({
          mes: formattedMonth,
          quantidade: 0
        });
      }
      
      // Preencher com os dados existentes
      const safeEvolucaoClientes = getSafeData(stats.evolucao_clientes);
      
      // Criar um mapa dos dados existentes para fácil acesso
      const dataMap = new Map();
      safeEvolucaoClientes.forEach(item => {
        dataMap.set(item.mes, item.quantidade);
      });
      
      // Substituir os valores zerados pelos dados reais onde existirem
      const mergedData = last12Months.map(month => ({
        mes: month.mes,
        quantidade: dataMap.has(month.mes) ? dataMap.get(month.mes) : 0
      }));
      
      setClientEvolutionData(mergedData);
    } else {
      setClientEvolutionData([]);
    }
  }, [stats]);

  return (
    <div className="flex flex-col space-y-4 w-full">
      <p className="text-muted-foreground">
        Bem-vindo ao seu painel de gestão de clientes. Aqui você encontra um resumo das suas estatísticas.
      </p>

      <StatsCards stats={stats} loading={loading} />

      <div className="w-full">
        <ClientEvolutionChart data={clientEvolutionData} loading={loading} />
      </div>
      
      <div className="w-full">
        <PaymentEvolutionChart data={safePagamentosPorMes} loading={loading} />
      </div>

      <DistributionCharts stats={stats} loading={loading} />
    </div>
  );
};
