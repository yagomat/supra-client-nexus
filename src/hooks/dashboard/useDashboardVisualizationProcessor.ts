import { useMemo } from "react";
import { DashboardStats } from "@/types";

interface RawDashboardData {
  distribuicao_dispositivos?: Array<{ dispositivo: string; quantidade: number }>;
  distribuicao_aplicativos?: Array<{ aplicativo: string; quantidade: number }>;
  evolucao_clientes?: Array<{ mes: string; quantidade: number }>;
  pagamentos_por_mes?: Array<{ mes: string; valor: number }>;
  [key: string]: any;
}

export const useDashboardVisualizationProcessor = (rawData: any): DashboardStats | null => {
  return useMemo(() => {
    if (!rawData) return null;

    const processedData = { ...rawData } as DashboardStats;

    // Processar e combinar distribuição de dispositivos
    if (processedData.distribuicao_dispositivos && Array.isArray(processedData.distribuicao_dispositivos)) {
      const dispositivosMap = new Map<string, number>();
      
      processedData.distribuicao_dispositivos.forEach((item: any) => {
        if (item.dispositivo) {
          const dispositivo = item.dispositivo.trim();
          const quantidade = item.quantidade || 0;
          
          if (dispositivosMap.has(dispositivo)) {
            dispositivosMap.set(dispositivo, dispositivosMap.get(dispositivo)! + quantidade);
          } else {
            dispositivosMap.set(dispositivo, quantidade);
          }
        }
      });
      
      // Converter de volta para array e ordenar
      processedData.distribuicao_dispositivos = Array.from(dispositivosMap)
        .map(([dispositivo, quantidade]) => ({ dispositivo, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);
    }

    // Processar e combinar distribuição de aplicativos
    if (processedData.distribuicao_aplicativos && Array.isArray(processedData.distribuicao_aplicativos)) {
      const aplicativosMap = new Map<string, number>();
      
      processedData.distribuicao_aplicativos.forEach((item: any) => {
        if (item.aplicativo) {
          const aplicativo = item.aplicativo.trim();
          const quantidade = item.quantidade || 0;
          
          if (aplicativosMap.has(aplicativo)) {
            aplicativosMap.set(aplicativo, aplicativosMap.get(aplicativo)! + quantidade);
          } else {
            aplicativosMap.set(aplicativo, quantidade);
          }
        }
      });
      
      // Converter de volta para array e ordenar
      processedData.distribuicao_aplicativos = Array.from(aplicativosMap)
        .map(([aplicativo, quantidade]) => ({ aplicativo, quantidade }))
        .sort((a, b) => b.quantidade - a.quantidade);
    }

    // Formatação adicional para gráficos
    if (processedData.evolucao_clientes && Array.isArray(processedData.evolucao_clientes)) {
      processedData.evolucao_clientes = processedData.evolucao_clientes.map((item: any) => ({
        ...item,
        // Formatação personalizada do mês se necessário
        mesFormatado: item.mes,
        crescimento: 0 // Pode calcular crescimento percentual aqui
      }));
    }

    if (processedData.pagamentos_por_mes && Array.isArray(processedData.pagamentos_por_mes)) {
      processedData.pagamentos_por_mes = processedData.pagamentos_por_mes.map((item: any, index: number, array: any[]) => ({
        ...item,
        // Calcular percentual de crescimento
        crescimentoPercentual: index > 0 && array[index - 1].valor > 0 
          ? ((item.valor - array[index - 1].valor) / array[index - 1].valor) * 100 
          : 0,
        // Formatação de moeda pode ser feita aqui se necessário
        valorFormatado: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(item.valor)
      }));
    }

    return processedData;
  }, [rawData]);
};