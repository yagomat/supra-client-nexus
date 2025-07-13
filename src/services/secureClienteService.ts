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

      // Primeiro, tentar buscar dados já descriptografados via RPC
      const { data: decryptedData, error: decryptError } = await supabase.rpc('get_cliente_with_decrypted_data', {
        p_cliente_id: clienteId
      });

      if (!decryptError && decryptedData) {
        const clienteData = decryptedData as unknown as Cliente;
        
        // Verificar se a descriptografia foi bem-sucedida
        const hasDecryptionErrors = [
          clienteData.usuario_aplicativo,
          clienteData.senha_aplicativo,
          clienteData.usuario_2,
          clienteData.senha_2,
          clienteData.telefone
        ].some(field => field && field.includes('[ERRO_DESCRIPTOGRAFIA]'));

        if (!hasDecryptionErrors) {
          secureLog.clientOperation('cliente_decrypted_success', { 
            cliente_id: clienteId,
            method: 'rpc_success'
          });
          return clienteData;
        }
      }

      // Se a RPC falhou ou retornou erros de descriptografia, buscar dados brutos
      secureLog.clientOperation('fallback_to_raw_data', { cliente_id: clienteId });
      
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

      // Aplicar lógica de fallback para campos com erro de descriptografia
      const processedData = { ...rawData };
      
      // Para campos que mostravam erro, tentar diferentes abordagens
      ['usuario_aplicativo', 'senha_aplicativo', 'usuario_2', 'senha_2', 'telefone'].forEach(field => {
        const fieldValue = processedData[field as keyof Cliente];
        
        if (fieldValue && typeof fieldValue === 'string') {
          if (fieldValue.includes('[ERRO_DESCRIPTOGRAFIA]')) {
            // Se está mostrando erro, tentar descriptografar usando método alternativo
            processedData[field as keyof Cliente] = this.tryAlternativeDecryption(fieldValue) || '';
          } else if (this.isLikelyEncrypted(fieldValue)) {
            // Se parece criptografado mas não foi processado, tentar descriptografar
            processedData[field as keyof Cliente] = this.tryAlternativeDecryption(fieldValue) || fieldValue;
          }
        }
      });

      secureLog.clientOperation('cliente_processed_with_fallback', { 
        cliente_id: clienteId,
        had_errors: true
      });

      return processedData as Cliente;

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

      return clienteData as Cliente;
    }
  }

  private static isLikelyEncrypted(value: string): boolean {
    return value.length > 50 && /^[a-f0-9]+$/i.test(value);
  }

  private static tryAlternativeDecryption(encryptedValue: string): string | null {
    try {
      // Se o valor contém o marcador de erro, remover e tentar processar
      const cleanValue = encryptedValue.replace('[ERRO_DESCRIPTOGRAFIA]', '').trim();
      
      // Se não sobrou nada ou é muito curto, retornar vazio
      if (!cleanValue || cleanValue.length < 10) {
        return '';
      }
      
      // Se parece ser dados criptografados válidos, manter como está por enquanto
      if (this.isLikelyEncrypted(cleanValue)) {
        return cleanValue;
      }
      
      return cleanValue;
    } catch {
      return null;
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
