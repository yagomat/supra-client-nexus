
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

export interface ClienteWithPaymentStatus {
  cliente: Cliente;
  payment_status: {
    type: string;
    days: number;
  };
  sorting_priority: number;
}

export class SecureClienteService {
  static async getClienteWithDecryptedData(clienteId: string): Promise<Cliente> {
    try {
      // Usar a função RPC que descriptografa os dados automaticamente
      const { data, error } = await supabase.rpc('get_cliente_with_decrypted_data', {
        p_cliente_id: clienteId
      });

      if (error) {
        console.error("Erro ao buscar cliente com dados descriptografados:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Cliente não encontrado");
      }

      // Type assertion com verificação
      return data as Cliente;
    } catch (error) {
      console.error("Erro no SecureClienteService:", error);
      // Em caso de erro, tentar buscar o cliente normal
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (clienteError) {
        throw clienteError;
      }

      return clienteData as Cliente;
    }
  }

  static async getAllClientesWithDecryptedData(): Promise<Cliente[]> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar todos os clientes do usuário
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('*') 
        .eq('user_id', currentUser.user.id)
        .order('nome');

      if (error) {
        console.error("Erro ao buscar clientes:", error);
        throw error;
      }

      // Para cada cliente, descriptografar os dados sensíveis se necessário
      const clientesDescriptografados = await Promise.all(
        (clientes || []).map(async (cliente) => {
          try {
            // Se os campos parecem estar criptografados (são muito longos e hexadecimais)
            if (this.isEncrypted(cliente.usuario_aplicativo) || 
                this.isEncrypted(cliente.senha_aplicativo) ||
                this.isEncrypted(cliente.telefone)) {
              
              return await this.getClienteWithDecryptedData(cliente.id);
            }
            
            return cliente;
          } catch (error) {
            console.warn(`Erro ao descriptografar cliente ${cliente.id}:`, error);
            return cliente; // Retorna o cliente sem descriptografar se der erro
          }
        })
      );

      return clientesDescriptografados;
    } catch (error) {
      console.error("Erro ao buscar clientes com dados descriptografados:", error);
      throw error;
    }
  }

  static async getClientes(status?: "todos" | "ativo" | "inativo"): Promise<Cliente[]> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }

      let query = supabase
        .from('clientes')
        .select('*')
        .eq('user_id', currentUser.user.id);

      if (status && status !== 'todos') {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('nome');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      throw error;
    }
  }

  static async getClientesWithCalculatedStatus(status?: "todos" | "ativo" | "inativo"): Promise<ClienteWithPaymentStatus[]> {
    try {
      const clientes = await this.getAllClientesWithDecryptedData();
      
      // Simular o status calculado para cada cliente
      const clientesWithStatus: ClienteWithPaymentStatus[] = clientes
        .filter(cliente => {
          if (!status || status === 'todos') return true;
          return cliente.status === status;
        })
        .map(cliente => ({
          cliente,
          payment_status: {
            type: cliente.status === 'ativo' ? 'up_to_date' : 'overdue',
            days: 0
          },
          sorting_priority: cliente.status === 'ativo' ? 1 : 2
        }));

      return clientesWithStatus;
    } catch (error) {
      console.error("Erro ao buscar clientes com status calculado:", error);
      throw error;
    }
  }

  static async createCliente(clienteData: Omit<Cliente, "id" | "created_at" | "status">): Promise<Cliente> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...clienteData,
          user_id: currentUser.user.id,
          status: 'inativo'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      throw error;
    }
  }

  static async updateCliente(id: string, clienteData: Partial<Cliente>): Promise<Cliente> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .eq('user_id', currentUser.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw error;
    }
  }

  static async deleteCliente(id: string): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.user.id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      throw error;
    }
  }

  static async migrateSensitiveData(): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('migrate_existing_sensitive_data');

      if (error) {
        throw error;
      }

      return data as string || 'Migração concluída com sucesso';
    } catch (error) {
      console.error("Erro na migração:", error);
      throw error;
    }
  }

  static async checkEncryptionStatus(): Promise<{ encrypted: number; total: number }> {
    try {
      const clientes = await this.getAllClientesWithDecryptedData();
      const encrypted = clientes.filter(c => 
        this.isEncrypted(c.usuario_aplicativo) || 
        this.isEncrypted(c.senha_aplicativo) ||
        this.isEncrypted(c.telefone)
      ).length;

      return {
        encrypted,
        total: clientes.length
      };
    } catch (error) {
      console.error("Erro ao verificar status de criptografia:", error);
      return { encrypted: 0, total: 0 };
    }
  }

  private static isEncrypted(value: string | null): boolean {
    if (!value) return false;
    // Verifica se o valor parece ser um hash criptografado (muito longo e hexadecimal)
    return value.length > 50 && /^[a-f0-9]+$/i.test(value);
  }
}
