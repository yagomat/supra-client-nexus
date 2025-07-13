import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";
import { secureLog } from "@/utils/secureLogger";

export interface ClienteWithPaymentStatus {
  cliente: Cliente;
  payment_status: {
    type: string;
    days: number;
  };
  sorting_priority: number;
}

// Definir campos sensíveis com tipagem específica
type SensitiveFields = 'usuario_aplicativo' | 'senha_aplicativo' | 'usuario_2' | 'senha_2' | 'telefone';

export class SecureClienteService {
  static async getClienteWithDecryptedData(clienteId: string): Promise<Cliente> {
    try {
      secureLog.clientOperation('get_cliente_decrypted', { cliente_id: clienteId });

      // Usar a função RPC para buscar dados descriptografados
      const { data: decryptedData, error: decryptError } = await supabase.rpc('get_cliente_with_decrypted_data', {
        p_cliente_id: clienteId
      });

      if (!decryptError && decryptedData && typeof decryptedData === 'object' && decryptedData !== null) {
        // Converter para Cliente e processar os dados
        const clienteData = decryptedData as unknown as Cliente;
        
        // Processar os dados para garantir que campos criptografados sejam limpos
        const processedData = this.processClienteData(clienteData);
        
        secureLog.clientOperation('cliente_decrypted_success', { 
          cliente_id: clienteId,
          method: 'rpc_success'
        });
        
        return processedData;
      }

      // Se a RPC falhou, buscar dados brutos e processar
      secureLog.clientOperation('fallback_to_raw_data', { 
        cliente_id: clienteId,
        rpc_error: decryptError?.message 
      });
      
      const { data: rawData, error: rawError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (rawError) {
        throw rawError;
      }

      if (!rawData) {
        throw new Error("Cliente não encontrado");
      }

      return this.processClienteData(rawData);

    } catch (error) {
      secureLog.error("Erro no SecureClienteService.getClienteWithDecryptedData", { 
        cliente_id: clienteId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // Último recurso: buscar dados brutos sem descriptografia
      const { data: clienteData, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (clienteError) {
        throw clienteError;
      }

      return this.processClienteData(clienteData);
    }
  }

  private static processClienteData(rawData: any): Cliente {
    const processedData = { ...rawData } as Cliente;
    
    // Para dados que parecem criptografados, limpar completamente
    const sensitiveFields: SensitiveFields[] = ['usuario_aplicativo', 'senha_aplicativo', 'usuario_2', 'senha_2', 'telefone'];
    
    sensitiveFields.forEach(field => {
      const fieldValue = processedData[field];
      
      if (fieldValue && typeof fieldValue === 'string') {
        // Se parece criptografado (muito longo e apenas caracteres hexadecimais), limpar o campo
        if (this.isEncryptedValue(fieldValue)) {
          (processedData as any)[field] = null;
        }
        // Se contém erro de descriptografia, também limpar
        else if (fieldValue.includes('[ERRO_DESCRIPTOGRAFIA]') || fieldValue.includes('ERROR') || fieldValue.includes('FAILED')) {
          (processedData as any)[field] = null;
        }
      }
    });

    return processedData;
  }

  private static isEncryptedValue(value: string): boolean {
    // Verificar se é um valor criptografado (hexadecimal longo)
    const isHex = /^[a-f0-9]+$/i.test(value);
    const isLong = value.length > 50;
    
    // Se é hexadecimal e muito longo, provavelmente é criptografado
    if (isHex && isLong) {
      return true;
    }
    
    // Verificar outros padrões de dados criptografados
    if (value.length > 100 && /^[A-Za-z0-9+/=]+$/.test(value)) {
      return true; // Base64 longo
    }
    
    return false;
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

      // Para cada cliente, tentar descriptografar usando a função RPC
      const clientesProcessados: Cliente[] = [];
      
      for (const cliente of clientes || []) {
        try {
          // Tentar usar a função RPC para descriptografar
          const { data: decryptedData, error: decryptError } = await supabase.rpc('get_cliente_with_decrypted_data', {
            p_cliente_id: cliente.id
          });

          if (!decryptError && decryptedData && typeof decryptedData === 'object' && decryptedData !== null) {
            const clienteData = decryptedData as unknown as Cliente;
            clientesProcessados.push(this.processClienteData(clienteData));
          } else {
            // Se a RPC falhou, processar os dados brutos
            clientesProcessados.push(this.processClienteData(cliente));
          }
        } catch (error) {
          // Em caso de erro, processar os dados brutos
          clientesProcessados.push(this.processClienteData(cliente));
        }
      }

      secureLog.clientOperation('all_clientes_processed', { 
        total: clientesProcessados.length,
        user_id: currentUser.user.id
      });

      return clientesProcessados;
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

      return (data || []).map(cliente => this.processClienteData(cliente));
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
        // Contar campos que ainda estão criptografados
        const sensitiveFields: SensitiveFields[] = ['usuario_aplicativo', 'senha_aplicativo', 'usuario_2', 'senha_2', 'telefone'];
        const hasEncrypted = sensitiveFields.some(field => {
          const value = cliente[field];
          return value && typeof value === 'string' && this.isEncryptedValue(value);
        });
        
        if (hasEncrypted) {
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
    return this.isEncryptedValue(value);
  }
}
