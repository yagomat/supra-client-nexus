
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

export interface SecurityValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitized_data: Partial<Cliente>;
}

export interface SecureOperationResult {
  success: boolean;
  error?: string;
  message?: string;
  validation?: SecurityValidationResult;
  cliente?: Cliente;
}

/**
 * Service para operações seguras de cliente que usam validação no backend
 */
export class ClienteSecurityService {
  /**
   * Valida dados do cliente usando validação do backend
   */
  static async validateClienteData(data: Partial<Cliente>): Promise<SecurityValidationResult> {
    try {
      const { data: result, error } = await supabase.rpc('validate_cliente_security', {
        p_nome: data.nome,
        p_servidor: data.servidor,
        p_dia_vencimento: data.dia_vencimento,
        p_aplicativo: data.aplicativo,
        p_usuario_aplicativo: data.usuario_aplicativo,
        p_senha_aplicativo: data.senha_aplicativo,
        p_telefone: data.telefone,
        p_uf: data.uf,
        p_valor_plano: data.valor_plano,
        p_user_id: null // Será definido automaticamente no backend
      });

      if (error) {
        throw error;
      }

      return result as unknown as SecurityValidationResult;
    } catch (error) {
      console.error('Erro na validação de segurança:', error);
      return {
        valid: false,
        errors: ['Erro interno de validação'],
        warnings: [],
        sanitized_data: {}
      };
    }
  }

  /**
   * Cria cliente com validação de segurança no backend
   */
  static async secureCreateCliente(data: Partial<Cliente>): Promise<SecureOperationResult> {
    try {
      // Verificar rate limiting usando a função consolidada
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        p_user_id: currentUser.user.id,
        p_operation: 'create_cliente',
        p_max_requests: 50,
        p_time_window_minutes: 60
      });

      if (rateLimitError) {
        console.error('Erro ao verificar rate limit:', rateLimitError);
      }

      if (!rateLimitOk) {
        return {
          success: false,
          error: 'Limite de operações excedido. Tente novamente em alguns minutos.'
        };
      }

      // Criar cliente usando função segura
      const { data: result, error } = await supabase.rpc('secure_create_cliente', {
        p_cliente_data: data,
        p_ip_address: this.getClientIP()
      });

      if (error) {
        throw error;
      }

      return result as unknown as SecureOperationResult;
    } catch (error) {
      console.error('Erro na criação segura do cliente:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Atualiza cliente com validação de segurança no backend
   */
  static async secureUpdateCliente(clienteId: string, data: Partial<Cliente>): Promise<SecureOperationResult> {
    try {
      // Verificar rate limiting usando a função consolidada
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        return {
          success: false,
          error: 'Usuário não autenticado'
        };
      }

      const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
        p_user_id: currentUser.user.id,
        p_operation: 'update_cliente',
        p_max_requests: 100,
        p_time_window_minutes: 60
      });

      if (rateLimitError) {
        console.error('Erro ao verificar rate limit:', rateLimitError);
      }

      if (!rateLimitOk) {
        return {
          success: false,
          error: 'Limite de operações excedido. Tente novamente em alguns minutos.'
        };
      }

      // Atualizar cliente usando função segura
      const { data: result, error } = await supabase.rpc('secure_update_cliente', {
        p_cliente_id: clienteId,
        p_cliente_data: data,
        p_ip_address: this.getClientIP()
      });

      if (error) {
        throw error;
      }

      return result as unknown as SecureOperationResult;
    } catch (error) {
      console.error('Erro na atualização segura do cliente:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Exclui cliente com validação de segurança no backend
   */
  static async secureDeleteCliente(clienteId: string): Promise<SecureOperationResult> {
    try {
      console.log("ClienteSecurityService: Tentando excluir cliente:", clienteId);
      const { data: result, error } = await supabase.rpc('secure_delete_cliente', {
        p_cliente_id: clienteId,
        p_ip_address: this.getClientIP()
      });

      if (error) {
        console.error("ClienteSecurityService: Erro na RPC:", error);
        throw error;
      }

      console.log("ClienteSecurityService: Resultado da exclusão:", result);
      return result as unknown as SecureOperationResult;
    } catch (error) {
      console.error('Erro na exclusão segura do cliente:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  /**
   * Verifica rate limit para exportação usando a função consolidada
   */
  static async checkExportRateLimit(): Promise<boolean> {
    try {
      console.log('checkExportRateLimit: Iniciando verificação...');
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        console.log('checkExportRateLimit: Usuário não autenticado');
        return false;
      }

      console.log('checkExportRateLimit: Usuário autenticado:', currentUser.user.id);
      console.log('checkExportRateLimit: Chamando check_export_rate_limit...');

      const { data: rateLimitOk, error } = await supabase.rpc('check_export_rate_limit', {
        p_user_id: currentUser.user.id,
        p_max_requests: 50,
        p_time_window_minutes: 60
      });

      console.log('checkExportRateLimit: Resposta da função:', { rateLimitOk, error });

      if (error) {
        console.error('checkExportRateLimit: Erro ao verificar rate limit de exportação:', error);
        return false;
      }

      console.log('checkExportRateLimit: Resultado final:', rateLimitOk);
      return rateLimitOk;
    } catch (error) {
      console.error('checkExportRateLimit: Erro ao verificar rate limit de exportação:', error);
      return false;
    }
  }

  /**
   * Registra tentativa de exportação usando a função consolidada
   */
  static async logExportAttempt(count: number): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      await supabase.rpc('log_audit_event', {
        p_user_id: currentUser.user.id,
        p_event_type: 'export_excel',
        p_details: {
          clientes_count: count,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registrar tentativa de exportação:', error);
    }
  }

  /**
   * Importa clientes via Edge Function segura
   */
  static async secureImportClientes(clientes: any[]): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('secure-excel-import', {
        body: { clientes }
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erro na importação segura:', error);
      throw error;
    }
  }

  /**
   * Registra operação de auditoria usando a função consolidada
   */
  static async logOperation(
    operation: string,
    clienteId?: string,
    oldData?: any,
    newData?: any
  ): Promise<void> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return;

      await supabase.rpc('log_audit_event', {
        p_user_id: currentUser.user.id,
        p_event_type: `cliente_${operation}`,
        p_details: {
          cliente_id: clienteId,
          operation: operation,
          old_data: oldData,
          new_data: newData,
          timestamp: new Date().toISOString()
        },
        p_ip_address: this.getClientIP()
      });
    } catch (error) {
      console.error('Erro ao registrar operação de auditoria:', error);
    }
  }

  /**
   * Obtém logs de auditoria do usuário
   */
  static async getAuditLogs(eventType?: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_audit_logs');
      
      if (error) {
        throw error;
      }

      let logs = data || [];
      
      // Filtrar por tipo de evento se especificado
      if (eventType) {
        logs = logs.filter((log: any) => log.event_type === eventType);
      }

      return logs;
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
      return [];
    }
  }

  /**
   * Obtém IP do cliente (simulado para demonstração)
   */
  private static getClientIP(): string {
    // Em produção, isso deveria ser obtido do servidor
    // Por agora, retornamos um placeholder
    return 'client-ip-placeholder';
  }

  /**
   * Sanitiza dados do cliente para exibição segura
   */
  static sanitizeClienteForDisplay(cliente: Cliente): Cliente {
    return {
      ...cliente,
      // Mascarar dados sensíveis para logs/exibição
      senha_aplicativo: '***',
      senha_2: cliente.senha_2 ? '***' : cliente.senha_2,
      // Garantir que telefone só contenha números
      telefone: cliente.telefone ? cliente.telefone.replace(/\D/g, '') : cliente.telefone
    };
  }

  /**
   * Verifica se os dados do cliente são válidos para operações críticas
   */
  static isClienteDataValid(cliente: Partial<Cliente>): boolean {
    return !!(
      cliente.nome &&
      cliente.servidor &&
      cliente.dia_vencimento &&
      cliente.aplicativo &&
      cliente.usuario_aplicativo &&
      cliente.senha_aplicativo
    );
  }
}
