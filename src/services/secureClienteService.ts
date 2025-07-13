
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";
import { secureLog } from "@/utils/secureLogger";
import { validateEncryptionFormat, detectClienteEncryptionStatus } from "@/utils/secureEncryption";

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
      secureLog.clientOperation('get_cliente_decrypted', { cliente_id: clienteId });

      // Usar a função RPC que descriptografa os dados automaticamente
      const { data, error } = await supabase.rpc('get_cliente_with_decrypted_data', {
        p_cliente_id: clienteId
      });

      if (error) {
        secureLog.error("Erro ao buscar cliente com dados descriptografados", { error: error.message });
        throw error;
      }

      if (!data) {
        throw new Error("Cliente não encontrado");
      }

      // Safe type conversion - convert unknown to Cliente properly
      const clienteData = data as unknown as Cliente;
      
      // Validate that we have the required fields
      if (!clienteData.id || !clienteData.nome || !clienteData.servidor) {
        throw new Error("Dados do cliente incompletos após descriptografia");
      }

      secureLog.clientOperation('cliente_decrypted_success', { 
        cliente_id: clienteId,
        has_encrypted_fields: detectClienteEncryptionStatus(clienteData).hasEncryptedFields
      });

      return clienteData;
    } catch (error) {
      secureLog.error("Erro no SecureClienteService.getClienteWithDecryptedData", { 
        cliente_id: clienteId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
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

      secureLog.clientOperation('get_all_clientes_decrypted', { user_id: currentUser.user.id });

      // Buscar todos os clientes do usuário
      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('*') 
        .eq('user_id', currentUser.user.id)
        .order('nome');

      if (error) {
        secureLog.error("Erro ao buscar clientes", { error: error.message });
        throw error;
      }

      // Para cada cliente, descriptografar os dados sensíveis se necessário
      const clientesDescriptografados = await Promise.all(
        (clientes || []).map(async (cliente) => {
          try {
            const encryptionStatus = detectClienteEncryptionStatus(cliente);
            
            if (encryptionStatus.hasEncryptedFields) {
              secureLog.devOnly('Cliente tem campos criptografados', { 
                cliente_id: cliente.id,
                encrypted_fields: encryptionStatus.encryptedFields 
              });
              
              return await this.getClienteWithDecryptedData(cliente.id);
            }
            
            return cliente;
          } catch (error) {
            secureLog.warn(`Erro ao descriptografar cliente ${cliente.id}`, { 
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            return cliente; // Retorna o cliente sem descriptografar se der erro
          }
        })
      );

      secureLog.clientOperation('all_clientes_processed', { 
        total: clientesDescriptografados.length,
        user_id: currentUser.user.id
      });

      return clientesDescriptografados;
    } catch (error) {
      secureLog.error("Erro ao buscar clientes com dados descriptografados", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
      secureLog.error("Erro ao buscar clientes", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
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
      secureLog.error("Erro ao buscar clientes com status calculado", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  static async createCliente(clienteData: Omit<Cliente, "id" | "created_at" | "status">): Promise<Cliente> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }

      secureLog.clientOperation('create_cliente_start', { user_id: currentUser.user.id });

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

      secureLog.clientOperation('create_cliente_success', { 
        cliente_id: data.id,
        user_id: currentUser.user.id
      });

      return data;
    } catch (error) {
      secureLog.error("Erro ao criar cliente", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  static async updateCliente(id: string, clienteData: Partial<Cliente>): Promise<Cliente> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }

      secureLog.clientOperation('update_cliente_start', { 
        cliente_id: id,
        user_id: currentUser.user.id
      });

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

      secureLog.clientOperation('update_cliente_success', { 
        cliente_id: id,
        user_id: currentUser.user.id
      });

      return data;
    } catch (error) {
      secureLog.error("Erro ao atualizar cliente", {
        cliente_id: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  static async deleteCliente(id: string): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }

      secureLog.clientOperation('delete_cliente_start', { 
        cliente_id: id,
        user_id: currentUser.user.id
      });

      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUser.user.id);

      if (error) {
        throw error;
      }

      secureLog.clientOperation('delete_cliente_success', { 
        cliente_id: id,
        user_id: currentUser.user.id
      });
    } catch (error) {
      secureLog.error("Erro ao excluir cliente", {
        cliente_id: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  static async migrateSensitiveData(): Promise<string> {
    try {
      secureLog.clientOperation('migrate_sensitive_data_start');

      const { data, error } = await supabase.rpc('migrate_existing_sensitive_data');

      if (error) {
        throw error;
      }

      secureLog.clientOperation('migrate_sensitive_data_success');

      return data as string || 'Migração concluída com sucesso';
    } catch (error) {
      secureLog.error("Erro na migração", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  static async checkEncryptionStatus(): Promise<{ encrypted: number; total: number }> {
    try {
      const clientes = await this.getAllClientesWithDecryptedData();
      
      let encryptedCount = 0;
      clientes.forEach(cliente => {
        const status = detectClienteEncryptionStatus(cliente);
        if (status.hasEncryptedFields) {
          encryptedCount++;
        }
      });

      return {
        encrypted: encryptedCount,
        total: clientes.length
      };
    } catch (error) {
      secureLog.error("Erro ao verificar status de criptografia", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return { encrypted: 0, total: 0 };
    }
  }

  private static isEncrypted(value: string | null): boolean {
    if (!value) return false;
    const validation = validateEncryptionFormat(value);
    return validation.isEncrypted;
  }
}
