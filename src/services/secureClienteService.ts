
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

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

      // O data já vem como JSON da função RPC
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

  private static isEncrypted(value: string | null): boolean {
    if (!value) return false;
    // Verifica se o valor parece ser um hash criptografado (muito longo e hexadecimal)
    return value.length > 50 && /^[a-f0-9]+$/i.test(value);
  }
}
