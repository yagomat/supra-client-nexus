import { DashboardStats } from "@/types";

/**
 * Função utilitária para lidar com verificações de segurança de arrays
 * Garante que valores null/undefined sejam tratados como arrays vazios
 */
export const getSafeData = (dataArray: any[] | null | undefined, defaultValue: any[] = []): any[] => {
  return Array.isArray(dataArray) ? dataArray : defaultValue;
};

/**
 * Função utilitária para obter valores numéricos seguros
 * Garante que valores null/undefined sejam tratados como 0
 */
export const getSafeNumber = (value: number | null | undefined, defaultValue: number = 0): number => {
  return typeof value === 'number' ? value : defaultValue;
};

/**
 * Função utilitária para obter strings seguras
 * Garante que valores null/undefined sejam tratados como string vazia
 */
export const getSafeString = (value: string | null | undefined, defaultValue: string = ''): string => {
  return typeof value === 'string' ? value : defaultValue;
};

/**
 * Hook utilitário para extrair dados seguros das estatísticas do dashboard
 * Centraliza todas as verificações de segurança em um só lugar
 */
export const useSafeDashboardData = (stats: DashboardStats | null) => {
  return {
    // Dados de evolução
    safeEvolucaoClientes: getSafeData(stats?.evolucao_clientes),
    safePagamentosPorMes: getSafeData(stats?.pagamentos_por_mes),
    
    // Dados de distribuição
    safeDispositivos: getSafeData(stats?.distribuicao_dispositivos),
    safeAplicativos: getSafeData(stats?.distribuicao_aplicativos),
    safeUfs: getSafeData(stats?.distribuicao_ufs),
    safeServidores: getSafeData(stats?.distribuicao_servidores),
    
    // Dados de alerta
    safeClientesInativos: getSafeNumber(stats?.clientes_inativos_proximos_dias),
    safeAppsVencendo: getSafeData(stats?.apps_vencendo_proximos_dias),
    safeClientesEmRiscoDetalhes: getSafeData(stats?.clientes_em_risco_detalhes),
    
    // Estatísticas básicas
    safeClientesAtivos: getSafeNumber(stats?.clientes_ativos),
    safeClientesInativosTotal: getSafeNumber(stats?.clientes_inativos),
    safeClientesNovos: getSafeNumber(stats?.clientes_novos),
    safeClientesTotal: getSafeNumber(stats?.clientes_total),
    safePagamentosPendentes: getSafeNumber(stats?.pagamentos_pendentes),
    safeValorRecebidoMes: getSafeNumber(stats?.valor_recebido_mes)
  };
};

/**
 * Funções utilitárias para formatação de texto
 */
export const formatUtils = {
  /**
   * Formata texto para singular/plural de clientes
   */
  getClientText: (count: number): string => {
    return count === 1 ? "cliente ficará inativo" : "clientes ficarão inativos";
  },
  
  /**
   * Formata texto para singular/plural de aplicativos
   */
  getAppText: (count: number): string => {
    return count === 1 ? "aplicativo vencerá" : "aplicativos vencerão";
  },
  
  /**
   * Formata texto de dias restantes
   */
  getDayText: (days: number): string => {
    if (days === 0) return "hoje";
    return days === 1 ? "amanhã" : `em ${days} dias`;
  },
  
  /**
   * Formata valores monetários para exibição
   */
  formatCurrency: (value: number): string => {
    return `R$ ${value.toFixed(2)}`.replace('.', ',');
  }
};