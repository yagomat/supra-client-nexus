import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

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

export interface RateLimitResult {
  allowed: boolean;
  current_requests: number;
  max_requests: number;
  time_window_minutes: number;
  reset_time: string;
  operation: string;
}

class SecureClienteService {
  private static async checkRateLimit(operation: string): Promise<RateLimitResult> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }

    const { data, error } = await supabase.rpc('check_comprehensive_rate_limit', {
      p_user_id: currentUser.user.id,
      p_operation: operation
    });

    if (error) {
      console.error(`Erro ao verificar rate limit para ${operation}:`, error);
      throw error;
    }

    if (!data || typeof data !== 'object') {
      throw new Error(`Resposta inválida do rate limit para ${operation}`);
    }

    const result = data as unknown as RateLimitResult;
    
    if (!result.allowed) {
      const resetTime = new Date(result.reset_time).toLocaleTimeString();
      throw new Error(
        `Limite de ${operation} excedido. Você pode tentar novamente às ${resetTime}. ` +
        `(${result.current_requests}/${result.max_requests} requisições em ${result.time_window_minutes}min)`
      );
    }

    return result;
  }

  // Obter clientes com status calculado no backend
  static async getClientesWithCalculatedStatus(
    status?: "todos" | "ativo" | "inativo"
  ): Promise<ClienteWithPaymentStatus[]> {
    // Verificar rate limit
    await this.checkRateLimit('list_clientes');

    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }

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

  // Buscar clientes com rate limiting
  static async getClientes(status?: "todos" | "ativo" | "inativo"): Promise<Cliente[]> {
    await this.checkRateLimit('list_clientes');

    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    if (status) {
      const { data, error } = await supabase.rpc(
        'filter_clientes_by_status',
        {
          p_status: status,
          p_user_id: userId || null
        }
      );
      
      if (error) {
        console.error("Erro ao buscar clientes:", error);
        throw error;
      }
      
      return data as Cliente[] || [];
    } else {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');
        
      if (error) {
        console.error("Erro ao buscar clientes:", error);
        throw error;
      }
      
      return data as Cliente[] || [];
    }
  }

  // Buscar clientes com filtro (para pesquisa)
  static async searchClientes(searchTerm: string, status?: "todos" | "ativo" | "inativo"): Promise<Cliente[]> {
    await this.checkRateLimit('search_clientes');

    const clientes = await this.getClientes(status);
    
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

  // Obter cliente específico
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

  // Criar cliente com rate limiting
  static async createCliente(cliente: Omit<Cliente, "id" | "created_at" | "status">): Promise<Cliente> {
    await this.checkRateLimit('create_cliente');

    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }
    
    const newCliente = {
      ...cliente,
      user_id: currentUser.user.id,
    };
    
    const { data, error } = await supabase
      .from('clientes')
      .insert([newCliente])
      .select()
      .single();
      
    if (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
    
    return data as Cliente;
  }

  // Atualizar cliente com rate limiting
  static async updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    await this.checkRateLimit('update_cliente');

    const { data, error } = await supabase
      .from('clientes')
      .update(cliente)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }
    
    return data as Cliente;
  }

  // Excluir cliente com rate limiting
  static async deleteCliente(id: string): Promise<void> {
    await this.checkRateLimit('delete_cliente');

    // Primeiro, excluir todos os pagamentos associados a este cliente
    const { error: pagamentosError } = await supabase
      .from('pagamentos')
      .delete()
      .eq('cliente_id', id);
      
    if (pagamentosError) {
      console.error("Erro ao excluir pagamentos do cliente:", pagamentosError);
      throw pagamentosError;
    }
    
    // Em seguida, excluir o cliente
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Erro ao excluir cliente:", error);
      throw error;
    }
  }

  // Calcular status de pagamento no backend
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

  // Verificar rate limit específico (para uso em componentes)
  static async checkOperationRateLimit(operation: string): Promise<boolean> {
    try {
      const result = await this.checkRateLimit(operation);
      return result.allowed;
    } catch (error) {
      console.error(`Rate limit check failed for ${operation}:`, error);
      return false;
    }
  }
}

export { SecureClienteService };