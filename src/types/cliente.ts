import { Cliente } from "./index";

// Tipos centralizados para filtros
export type StatusFilterType = "todos" | "ativo" | "inativo";
export type OrderByType = "nome_asc" | "nome_desc" | "data_asc" | "data_desc";

// Interface para cliente com status de pagamento
export interface ClienteWithPaymentStatus {
  cliente: Cliente;
  paymentStatus: {
    type: 'overdue' | 'today' | 'upcoming' | 'no_info';
    days: number;
    lastPaymentDate?: string;
    nextDueDate?: string;
  };
  sortingPriority: number;
}

// Interface para resultado de operações seguras
export interface SecureOperationResult {
  success: boolean;
  error?: string;
  message?: string;
  cliente?: Cliente;
}

// Interface para validação de dados
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  sanitized_data?: Record<string, any>;
}

// Rate limits padronizados
export const RATE_LIMITS = {
  list: { max: 100, window: 60 },
  create: { max: 20, window: 60 },
  update: { max: 50, window: 60 },
  delete: { max: 10, window: 60 },
  search: { max: 50, window: 60 },
  export: { max: 50, window: 3600 } // 50 por hora
} as const;

// Tipos para operações
export type ClienteOperation = 'list' | 'create' | 'update' | 'delete' | 'search' | 'export';