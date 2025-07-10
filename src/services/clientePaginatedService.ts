import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  status?: "todos" | "ativo" | "inativo";
  includeSensitive?: boolean;
}

export interface PaginatedResponse {
  data: Cliente[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface SensitiveClienteData {
  id: string;
  senha_aplicativo: string;
  senha_2?: string;
  usuario_aplicativo: string;
  usuario_2?: string;
  observacoes?: string;
}

/**
 * Service para operações paginadas e seguras de clientes
 */
export class ClientePaginatedService {
  /**
   * Busca clientes com paginação server-side
   */
  static async getPaginatedClientes(params: PaginationParams): Promise<PaginatedResponse> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }

    // Verificar rate limiting
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_search_rate_limit', {
      p_user_id: currentUser.user.id,
      p_max_requests: 30,
      p_time_window_minutes: 1
    });

    if (rateLimitError) {
      console.error('Erro ao verificar rate limit:', rateLimitError);
    }

    if (!rateLimitOk) {
      throw new Error('Limite de buscas excedido. Aguarde um momento antes de buscar novamente.');
    }

    const { data, error } = await supabase.rpc('get_clientes_paginated', {
      p_user_id: currentUser.user.id,
      p_page: params.page,
      p_limit: Math.min(params.limit, 100), // Máximo 100
      p_include_sensitive: params.includeSensitive || false,
      p_search: params.search || null,
      p_status: params.status || 'todos'
    });

    if (error) {
      console.error("Erro ao buscar clientes paginados:", error);
      throw error;
    }

    return data as unknown as PaginatedResponse;
  }

  /**
   * Busca dados sensíveis específicos de um cliente
   */
  static async getClienteSensitiveData(clienteId: string): Promise<SensitiveClienteData> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }

    const { data, error } = await supabase.rpc('get_cliente_sensitive_data', {
      p_user_id: currentUser.user.id,
      p_cliente_id: clienteId
    });

    if (error) {
      console.error("Erro ao buscar dados sensíveis:", error);
      throw error;
    }

    const result = data as any;
    if (result?.error) {
      throw new Error(result.error);
    }

    // Log adicional para auditoria
    await this.logSensitiveDataAccess('view', clienteId, 'full_sensitive_data');

    return result as SensitiveClienteData;
  }

  /**
   * Registra acesso a dados sensíveis para auditoria
   */
  static async logSensitiveDataAccess(
    operation: string, 
    clienteId: string, 
    dataType: string
  ): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) return;

      await supabase.rpc('log_sensitive_data_access', {
        p_user_id: currentUser.user.id,
        p_operation: operation,
        p_cliente_id: clienteId,
        p_data_type: dataType,
        p_ip_address: 'client-browser' // Placeholder para IP do cliente
      });
    } catch (error) {
      console.error('Erro ao registrar acesso a dados sensíveis:', error);
    }
  }

  /**
   * Cache inteligente para dados básicos vs sensíveis
   */
  static async getCachedCliente(
    clienteId: string, 
    includeSensitive: boolean = false
  ): Promise<Cliente | SensitiveClienteData> {
    const cacheKey = `cliente_${clienteId}_${includeSensitive ? 'sensitive' : 'basic'}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const parsedCache = JSON.parse(cached);
      const now = Date.now();
      
      // Cache básico: 5 minutos, Cache sensível: 1 minuto
      const cacheTimeout = includeSensitive ? 60000 : 300000;
      
      if (now - parsedCache.timestamp < cacheTimeout) {
        return parsedCache.data;
      }
    }

    // Se não está em cache ou expirou, buscar dados
    let data;
    if (includeSensitive) {
      data = await this.getClienteSensitiveData(clienteId);
    } else {
      // Para dados básicos, usar a função paginada com limite 1
      const result = await this.getPaginatedClientes({
        page: 1,
        limit: 1,
        includeSensitive: false
      });
      data = result.data.find(c => c.id === clienteId);
    }

    // Salvar no cache
    localStorage.setItem(cacheKey, JSON.stringify({
      data,
      timestamp: Date.now()
    }));

    return data;
  }

  /**
   * Limpa cache de um cliente específico
   */
  static clearClienteCache(clienteId: string): void {
    localStorage.removeItem(`cliente_${clienteId}_basic`);
    localStorage.removeItem(`cliente_${clienteId}_sensitive`);
  }

  /**
   * Limpa todo o cache de clientes
   */
  static clearAllClientesCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cliente_')) {
        localStorage.removeItem(key);
      }
    });
  }
}