
export type PaymentStatus = "pago" | "pago_confianca" | "nao_pago";

export interface Cliente {
  id: string;
  created_at: string;
  nome: string;
  telefone: string | null;
  uf: string | null;
  servidor: string;
  dia_vencimento: number;
  valor_plano: number | null;
  
  // Tela principal
  dispositivo_smart: string | null;
  aplicativo: string;
  usuario_aplicativo: string;
  senha_aplicativo: string;
  data_licenca_aplicativo: string | null;
  
  // Tela adicional
  possui_tela_adicional: boolean;
  dispositivo_smart_2: string | null;
  aplicativo_2: string | null;
  usuario_2: string | null;
  senha_2: string | null;
  data_licenca_2: string | null;
  
  observacoes: string | null;
  status: string; // Changed from "ativo" | "inativo" to string to match what comes from the database
}

export interface ClienteComPagamentos extends Cliente {
  pagamentos: {
    [key: string]: Pagamento;
  };
}

export interface Pagamento {
  id: string;
  cliente_id: string;
  mes: number; // 1-12
  ano: number;
  status: string; // Changed from PaymentStatus to string to match what comes from the database
  data_pagamento: string | null;
  created_at: string;
}

export interface DashboardStats {
  clientes_ativos: number;
  clientes_inativos: number;
  clientes_novos: number;
  evolucao_clientes: {
    mes: string;
    quantidade: number;
  }[];
  distribuicao_dispositivos: {
    dispositivo: string;
    quantidade: number;
  }[];
  distribuicao_aplicativos: {
    aplicativo: string;
    quantidade: number;
  }[];
  distribuicao_ufs: {
    uf: string;
    quantidade: number;
  }[];
  distribuicao_servidores: {
    servidor: string;
    quantidade: number;
  }[];
}

export interface ValoresPredefinidos {
  ufs: string[];
  servidores: string[];
  dias_vencimento: number[];
  valores_plano: number[];
  dispositivos_smart: string[];
  aplicativos: string[];
}

export interface User {
  id: string;
  email: string;
  nome?: string;
}
