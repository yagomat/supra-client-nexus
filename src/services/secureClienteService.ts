
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

    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: currentUser.user.id,
      p_operation: operation,
      p_max_requests: 50,
      p_time_window_minutes: 60
    });

    if (error) {
      console.error(`Erro ao verificar rate limit para ${operation}:`, error);
      throw error;
    }

    const allowed = data as boolean;
    
    const result: RateLimitResult = {
      allowed,
      current_requests: allowed ? 0 : 50,
      max_requests: 50,
      time_window_minutes: 60,
      reset_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      operation
    };
    
    if (!result.allowed) {
      const resetTime = new Date(result.reset_time).toLocaleTimeString();
      throw new Error(
        `Limite de ${operation} excedido. Você pode tentar novamente às ${resetTime}. ` +
        `(${result.current_requests}/${result.max_requests} requisições em ${result.time_window_minutes}min)`
      );
    }

    return result;
  }

  // Obter cliente específico com dados descriptografados
  static async getClienteWithDecryptedData(id: string): Promise<Cliente> {
    await this.checkRateLimit('get_cliente');

    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }

    const { data, error } = await supabase.rpc('get_cliente_with_decrypted_data', {
      p_cliente_id: id,
      p_user_id: currentUser.user.id
    });

    if (error) {
      console.error("Erro ao buscar cliente com dados descriptografados:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Cliente não encontrado");
    }

    return data[0] as Cliente;
  }

  // Obter clientes com status calculado no backend
  static async getClientesWithCalculatedStatus(
    status?: "todos" | "ativo" | "inativo"
  ): Promise<ClienteWithPaymentStatus[]> {
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

    // Para cada cliente, descriptografar dados sensíveis
    const clientesWithDecryptedData = await Promise.all(
      (data || []).map(async (item: any) => {
        try {
          const decryptedCliente = await this.getClienteWithDecryptedData(item.cliente_data.id);
          return {
            cliente: decryptedCliente,
            paymentStatus: item.payment_status,
            sortingPriority: item.sorting_priority
          };
        } catch (error) {
          console.error(`Erro ao descriptografar dados do cliente ${item.cliente_data.id}:`, error);
          // Fallback para dados criptografados se descriptografia falhar
          return {
            cliente: item.cliente_data as Cliente,
            paymentStatus: item.payment_status,
            sortingPriority: item.sorting_priority
          };
        }
      })
    );

    return clientesWithDecryptedData;
  }

  // Buscar clientes com dados descriptografados
  static async getClientes(status?: "todos" | "ativo" | "inativo"): Promise<Cliente[]> {
    await this.checkRateLimit('list_clientes');

    const { data: currentUser } = await supabase.auth.getUser();
    const userId = currentUser.user?.id;
    
    let clientesData;
    
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
      
      clientesData = data as Cliente[] || [];
    } else {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome');
        
      if (error) {
        console.error("Erro ao buscar clientes:", error);
        throw error;
      }
      
      clientesData = data as Cliente[] || [];
    }

    // Descriptografar dados sensíveis para cada cliente
    const clientesWithDecryptedData = await Promise.all(
      clientesData.map(async (cliente) => {
        try {
          return await this.getClienteWithDecryptedData(cliente.id);
        } catch (error) {
          console.error(`Erro ao descriptografar dados do cliente ${cliente.id}:`, error);
          // Fallback para dados criptografados se descriptografia falhar
          return cliente;
        }
      })
    );

    return clientesWithDecryptedData;
  }

  // Criar cliente com criptografia automática
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
    
    // Inserir cliente (trigger criptografará automaticamente os dados sensíveis)
    const { data, error } = await supabase
      .from('clientes')
      .insert([newCliente])
      .select()
      .single();
      
    if (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
    
    // Retornar dados descriptografados
    return await this.getClienteWithDecryptedData(data.id);
  }

  // Atualizar cliente com criptografia automática
  static async updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    await this.checkRateLimit('update_cliente');

    // Atualizar cliente (trigger criptografará automaticamente os dados sensíveis)
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
    
    // Retornar dados descriptografados
    return await this.getClienteWithDecryptedData(id);
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

  // Executar migração de dados existentes
  static async migrateSensitiveData(): Promise<string> {
    const { data: currentUser } = await supabase.auth.getUser();
    
    if (!currentUser.user) {
      throw new Error("Usuário não autenticado");
    }

    const { data, error } = await supabase.rpc('migrate_existing_sensitive_data');

    if (error) {
      console.error("Erro ao migrar dados sensíveis:", error);
      throw error;
    }

    return data as string;
  }
}

export { SecureClienteService };
