import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";
import { 
  StatusFilterType, 
  SecureOperationResult, 
  ValidationResult, 
  ClienteWithPaymentStatus,
  RATE_LIMITS,
  ClienteOperation 
} from "@/types/cliente";

/**
 * Serviço unificado consolidado para todas as operações de cliente
 * Substitui ClienteService, UnifiedClienteService e ClienteSecurityService
 */
export class UnifiedClienteService {
  
  /**
   * Verificação de rate limit centralizada
   */
  private static async checkRateLimit(userId: string, operation: ClienteOperation): Promise<void> {
    const limits = RATE_LIMITS[operation];
    
    const { data: allowed, error } = await supabase.rpc('check_consolidated_rate_limit', {
      p_user_id: userId,
      p_operation: operation,
      p_max_requests: limits.max,
      p_time_window_minutes: limits.window
    });

    if (error) throw error;
    
    const allowedData = allowed as any;
    if (!allowedData?.allowed) {
      throw new Error(`Rate limit excedido para ${operation}. Tente novamente em ${limits.window} minutos.`);
    }
  }

  /**
   * Buscar clientes com filtro de status
   */
  static async getClientes(status?: StatusFilterType): Promise<Cliente[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) throw new Error("Usuário não autenticado");

    await this.checkRateLimit(userId, 'list');

    const { data, error } = await supabase.rpc('filter_clientes_by_status', {
      p_status: status === 'todos' ? null : status,
      p_user_id: userId
    });
    
    if (error) throw error;
    return data as Cliente[] || [];
  }

  /**
   * Buscar clientes com status de pagamento calculado
   */
  static async getClientesWithCalculatedStatus(status?: StatusFilterType): Promise<ClienteWithPaymentStatus[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) throw new Error("Usuário não autenticado");

    await this.checkRateLimit(userId, 'list');

    const { data, error } = await supabase.rpc('get_clientes_with_calculated_status', {
      p_user_id: userId,
      p_status: status === 'todos' ? null : status
    });
    
    if (error) throw error;
    
    // Transform the data to match our interface
    return (data || []).map((item: any) => ({
      cliente: item.cliente_data,
      paymentStatus: item.payment_status,
      sortingPriority: item.sorting_priority
    }));
  }

  /**
   * Buscar cliente específico
   */
  static async getCliente(id: string): Promise<Cliente | null> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  }

  /**
   * Buscar clientes por termo de pesquisa
   */
  static async searchClientes(searchTerm: string, status?: StatusFilterType): Promise<Cliente[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) throw new Error("Usuário não autenticado");

    await this.checkRateLimit(userId, 'search');

    const clientes = await this.getClientes(status);
    
    if (!searchTerm.trim()) return clientes;

    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return clientes.filter(cliente => 
      cliente.nome?.toLowerCase().includes(normalizedSearch) ||
      cliente.telefone?.toLowerCase().includes(normalizedSearch) ||
      cliente.servidor?.toLowerCase().includes(normalizedSearch) ||
      cliente.uf?.toLowerCase().includes(normalizedSearch) ||
      cliente.aplicativo?.toLowerCase().includes(normalizedSearch)
    );
  }

  /**
   * Criar cliente com validação completa
   */
  static async createCliente(clienteData: Omit<Cliente, "id" | "created_at" | "status">): Promise<SecureOperationResult> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      await this.checkRateLimit(userId, 'create');

      const { data: result, error } = await supabase.rpc('secure_create_cliente', {
        p_cliente_data: {
          ...clienteData,
          user_id: userId
        }
      });

      if (error) throw error;

      return result as unknown as SecureOperationResult;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Erro ao criar cliente"
      };
    }
  }

  /**
   * Atualizar cliente com validação completa
   */
  static async updateCliente(id: string, clienteData: Partial<Cliente>): Promise<SecureOperationResult> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      await this.checkRateLimit(userId, 'update');

      const { data: result, error } = await supabase.rpc('secure_update_cliente', {
        p_cliente_id: id,
        p_cliente_data: clienteData
      });

      if (error) throw error;

      return result as unknown as SecureOperationResult;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Erro ao atualizar cliente"
      };
    }
  }

  /**
   * Excluir cliente
   */
  static async deleteCliente(id: string): Promise<SecureOperationResult> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) {
      return { success: false, error: "Usuário não autenticado" };
    }

    try {
      await this.checkRateLimit(userId, 'delete');

      const { data: result, error } = await supabase.rpc('secure_delete_cliente', {
        p_cliente_id: id
      });

      if (error) throw error;

      return result as unknown as SecureOperationResult;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Erro ao excluir cliente"
      };
    }
  }

  /**
   * Verificar se operação pode ser executada (rate limit)
   */
  static async checkOperationRateLimit(operation: ClienteOperation): Promise<boolean> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) return false;

    try {
      await this.checkRateLimit(userId, operation);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Calcular status de pagamento de um cliente
   */
  static async calculatePaymentStatus(clienteId: string): Promise<any> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase.rpc('calculate_cliente_payment_status', {
      p_cliente_id: clienteId,
      p_user_id: userId
    });

    if (error) throw error;
    return data;
  }

  /**
   * Registrar tentativa de exportação (para rate limiting)
   */
  static async logExportAttempt(count: number): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) throw new Error("Usuário não autenticado");

    const { error } = await supabase.rpc('log_export_attempt', {
      p_user_id: userId,
      p_count: count
    });

    if (error) throw error;
  }

  /**
   * Verificar rate limit de exportação
   */
  static async checkExportRateLimit(): Promise<boolean> {
    return this.checkOperationRateLimit('export');
  }

  /**
   * Importar clientes via Edge Function
   */
  static async secureImportClientes(clientesData: any[]): Promise<any> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase.functions.invoke('secure-excel-import', {
      body: { clientes: clientesData }
    });

    if (error) throw error;
    return data;
  }
}

// Exports para compatibilidade com código existente
export const getClientes = UnifiedClienteService.getClientes;
export const getClientesWithCalculatedStatus = UnifiedClienteService.getClientesWithCalculatedStatus;
export const getCliente = UnifiedClienteService.getCliente;
export const searchClientes = UnifiedClienteService.searchClientes;
export const createCliente = UnifiedClienteService.createCliente;
export const updateCliente = UnifiedClienteService.updateCliente;
export const deleteCliente = UnifiedClienteService.deleteCliente;
export const checkOperationRateLimit = UnifiedClienteService.checkOperationRateLimit;
export const calculatePaymentStatus = UnifiedClienteService.calculatePaymentStatus;
export const logExportAttempt = UnifiedClienteService.logExportAttempt;
export const checkExportRateLimit = UnifiedClienteService.checkExportRateLimit;
export const secureImportClientes = UnifiedClienteService.secureImportClientes;