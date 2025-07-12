
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

/**
 * Service para gerenciar operações seguras com senhas de clientes
 */
export class ClientePasswordService {
  /**
   * Busca cliente com senhas descriptografadas de forma segura
   */
  static async getClienteWithDecryptedPasswords(clienteId: string): Promise<Cliente | null> {
    try {
      const { data, error } = await supabase.rpc('get_cliente_with_decrypted_passwords', {
        p_cliente_id: clienteId
      });

      if (error) {
        console.error('Erro ao buscar cliente com senhas descriptografadas:', error);
        throw error;
      }

      // Verificar se a resposta contém erro
      if (data && typeof data === 'object' && 'error' in data) {
        console.error('Erro retornado da função:', (data as any).error);
        return null;
      }

      return data as unknown as Cliente;
    } catch (error) {
      console.error('Erro no ClientePasswordService.getClienteWithDecryptedPasswords:', error);
      throw error;
    }
  }

  /**
   * Migra senhas existentes para o formato criptografado
   * Apenas usuários admin podem executar esta operação
   */
  static async migrateExistingPasswords(): Promise<{
    success: boolean;
    senhas_aplicativo_migradas: number;
    senhas_2_migradas: number;
    total_migradas: number;
    errors: string[];
  }> {
    try {
      const { data, error } = await supabase.rpc('migrate_existing_passwords');

      if (error) {
        console.error('Erro ao migrar senhas existentes:', error);
        throw error;
      }

      return data as {
        success: boolean;
        senhas_aplicativo_migradas: number;
        senhas_2_migradas: number;
        total_migradas: number;
        errors: string[];
      };
    } catch (error) {
      console.error('Erro no ClientePasswordService.migrateExistingPasswords:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma senha já está criptografada
   */
  static isPasswordEncrypted(password: string | null): boolean {
    if (!password || password === '') return false;
    // Senhas criptografadas têm formato hexadecimal com 64+ caracteres
    return /^[a-f0-9]{64,}$/.test(password);
  }

  /**
   * Prepara dados do cliente para envio, garantindo que senhas sejam processadas corretamente
   */
  static prepareClienteForSubmission(clienteData: Partial<Cliente>): Partial<Cliente> {
    // O trigger no banco vai criptografar automaticamente as senhas se não estiverem já criptografadas
    // Então podemos enviar as senhas em texto plano normalmente
    return {
      ...clienteData,
      // Garantir que senhas vazias sejam tratadas como null
      senha_aplicativo: clienteData.senha_aplicativo?.trim() === '' ? null : clienteData.senha_aplicativo,
      senha_2: clienteData.senha_2?.trim() === '' ? null : clienteData.senha_2
    };
  }
}
