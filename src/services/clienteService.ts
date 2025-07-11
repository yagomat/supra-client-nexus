
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

export interface SecureOperationResult {
  success: boolean;
  error?: string;
  message?: string;
  cliente?: Cliente;
}

// Rate limit padronizado
const RATE_LIMITS = {
  list: { max: 100, window: 60 },
  create: { max: 20, window: 60 },
  update: { max: 50, window: 60 },
  delete: { max: 10, window: 60 }
};

/**
 * Serviço unificado para operações com clientes
 * Consolidação de clienteService e secureClienteService
 */
export class ClienteService {
  
  /**
   * Busca clientes com rate limiting e filtros
   */
  static async getClientes(status?: "todos" | "ativo" | "inativo"): Promise<Cliente[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    // Rate limiting
    await this.checkRateLimit(userId, 'list_clientes');

    const { data, error } = await supabase.rpc('filter_clientes_by_status', {
      p_status: status || null,
      p_user_id: userId
    });
    
    if (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }
    
    return data as Cliente[] || [];
  }

  /**
   * Busca cliente específico
   */
  static async getCliente(id: string): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Erro ao buscar cliente:", error);
      throw error;
    }
    
    return data as Cliente;
  }

  /**
   * Cria cliente com validação de segurança
   */
  static async createCliente(cliente: Omit<Cliente, "id" | "created_at" | "status">): Promise<SecureOperationResult> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      // Rate limiting
      await this.checkRateLimit(currentUser.user.id, 'create_cliente');

      // Usar função segura do backend
      const { data: result, error } = await supabase.rpc('secure_create_cliente', {
        p_cliente_data: cliente,
        p_ip_address: 'client-ip'
      });

      if (error) throw error;
      return result as unknown as SecureOperationResult;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Atualiza cliente com validação de segurança
   */
  static async updateCliente(id: string, cliente: Partial<Cliente>): Promise<SecureOperationResult> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      // Rate limiting
      await this.checkRateLimit(currentUser.user.id, 'update_cliente');

      const { data: result, error } = await supabase.rpc('secure_update_cliente', {
        p_cliente_id: id,
        p_cliente_data: cliente,
        p_ip_address: 'client-ip'
      });

      if (error) throw error;
      return result as unknown as SecureOperationResult;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Exclui cliente com validação de segurança
   */
  static async deleteCliente(id: string): Promise<SecureOperationResult> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        return { success: false, error: "Usuário não autenticado" };
      }

      // Rate limiting
      await this.checkRateLimit(currentUser.user.id, 'delete_cliente');

      const { data: result, error } = await supabase.rpc('secure_delete_cliente', {
        p_cliente_id: id,
        p_ip_address: 'client-ip'
      });

      if (error) throw error;
      return result as unknown as SecureOperationResult;
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  /**
   * Verifica rate limit
   */
  private static async checkRateLimit(userId: string, operation: string): Promise<void> {
    const limits = RATE_LIMITS[operation as keyof typeof RATE_LIMITS] || RATE_LIMITS.list;
    
    const { data: allowed, error } = await supabase.rpc('check_comprehensive_rate_limit', {
      p_user_id: userId,
      p_operation: operation,
      p_max_requests: limits.max,
      p_time_window_minutes: limits.window
    });

    if (error) {
      console.error(`Erro ao verificar rate limit para ${operation}:`, error);
      return;
    }

    if (!(allowed as any)?.allowed) {
      const resetTime = new Date((allowed as any)?.reset_time).toLocaleTimeString();
      throw new Error(
        `Limite de ${operation} excedido. Tente novamente às ${resetTime}. ` +
        `(${(allowed as any)?.current_requests}/${(allowed as any)?.max_requests} em ${(allowed as any)?.time_window_minutes}min)`
      );
    }
  }
}

// Manter compatibilidade com funções antigas
export const getClientes = ClienteService.getClientes;
export const getCliente = ClienteService.getCliente;
export const createCliente = async (cliente: Omit<Cliente, "id" | "created_at" | "status">): Promise<Cliente> => {
  const result = await ClienteService.createCliente(cliente);
  if (!result.success) throw new Error(result.error);
  return result.cliente!;
};
export const updateCliente = async (id: string, cliente: Partial<Cliente>): Promise<Cliente> => {
  const result = await ClienteService.updateCliente(id, cliente);
  if (!result.success) throw new Error(result.error);
  return result.cliente!;
};
export const deleteCliente = async (id: string): Promise<void> => {
  const result = await ClienteService.deleteCliente(id);
  if (!result.success) throw new Error(result.error);
};
