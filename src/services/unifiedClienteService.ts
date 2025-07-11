import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";
import { ClienteService } from "./clienteService";

/**
 * Service unificado que substitui tanto clienteService quanto secureClienteService
 * Consolidação para eliminar duplicação de código
 */
export class UnifiedClienteService {
  
  /**
   * Busca clientes com status calculado no backend
   */
  static async getClientesWithCalculatedStatus(
    status?: "todos" | "ativo" | "inativo"
  ): Promise<any[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }

    // Rate limiting
    await this.checkRateLimit(currentUser.user.id, 'list_clientes');

    const { data, error } = await supabase.rpc('get_clientes_with_calculated_status', {
      p_user_id: currentUser.user.id,
      p_status: status || null
    });

    if (error) {
      console.error("Erro ao buscar clientes com status calculado:", error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      cliente: item.cliente_data as Cliente,
      paymentStatus: item.payment_status,
      sortingPriority: item.sorting_priority
    }));
  }

  /**
   * Buscar clientes com filtro (para pesquisa)
   */
  static async searchClientes(searchTerm: string, status?: "todos" | "ativo" | "inativo"): Promise<Cliente[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }

    await this.checkRateLimit(currentUser.user.id, 'search_clientes');

    const clientes = await ClienteService.getClientes(status);
    
    if (!searchTerm.trim()) {
      return clientes;
    }

    const term = searchTerm.toLowerCase().trim();
    return clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(term) ||
      cliente.servidor.toLowerCase().includes(term) ||
      (cliente.telefone && cliente.telefone.includes(term))
    );
  }

  /**
   * Verificar rate limit específico
   */
  static async checkOperationRateLimit(operation: string): Promise<boolean> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser.user) {
        return false;
      }

      const result = await this.checkRateLimit(currentUser.user.id, operation);
      return true;
    } catch (error) {
      console.error(`Rate limit check failed for ${operation}:`, error);
      return false;
    }
  }

  /**
   * Calcular status de pagamento no backend
   */
  static async calculatePaymentStatus(clienteId: string): Promise<any> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }

    const { data, error } = await supabase.rpc('calculate_cliente_payment_status', {
      p_cliente_id: clienteId,
      p_user_id: currentUser.user.id
    });

    if (error) {
      console.error("Erro ao calcular status de pagamento:", error);
      throw error;
    }

    return data;
  }

  /**
   * Verificar rate limit interno
   */
  private static async checkRateLimit(userId: string, operation: string): Promise<void> {
    const { data: allowed, error } = await supabase.rpc('check_comprehensive_rate_limit', {
      p_user_id: userId,
      p_operation: operation
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

// Export direto para compatibilidade
export const getClientesWithCalculatedStatus = UnifiedClienteService.getClientesWithCalculatedStatus;
export const searchClientes = UnifiedClienteService.searchClientes;
export const calculatePaymentStatus = UnifiedClienteService.calculatePaymentStatus;
export const checkOperationRateLimit = UnifiedClienteService.checkOperationRateLimit;