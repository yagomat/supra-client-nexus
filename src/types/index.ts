
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
  clientes_total: number;
  pagamentos_pendentes: number;
  valor_recebido_mes: number;
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
  pagamentos_por_mes?: {
    mes: string;
    valor: number;
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

// Definição dos papéis de usuário
export type UserRole = 'admin' | 'gerente' | 'operador';

export interface UserWithRole extends User {
  roles: UserRole[];
}

// Interface para registros de auditoria
export interface AuditoriaRecord {
  id: string;
  tabela: string;
  operacao: string;
  registro_id: string;
  dados_antigos: any;
  dados_novos: any;
  usuario_id: string | null;
  data_hora: string;
}

// Interface para a tabela de papéis de usuário
export interface UserRoleRecord {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

// Import ClienteFormValues type from the schema file
import { ClienteFormValues } from "@/hooks/cliente/clienteFormSchema";
export type { ClienteFormValues };
