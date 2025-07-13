
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
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', clienteId)
        .single();

      if (error) {
        console.error("Erro ao buscar cliente:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Cliente não encontrado");
      }

      return data as Cliente;
    } catch (error) {
      console.error("Erro no SecureClienteService:", error);
      throw error;
    }
  }

  static async getAllClientesWithDecryptedData(): Promise<Cliente[]> {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        throw new Error("Usuário não autenticado");
      }

      const { data: clientes, error } = await supabase
        .from('clientes')
        .select('*') 
        .eq('user_id', currentUser.user.id)
        .order('nome');

      if (error) {
        console.error("Erro ao buscar clientes:", error);
        throw error;
      }

      return clientes || [];
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
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
        console.error("Erro ao criar cliente:", error);
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

      console.log("Atualizando cliente com dados:", clienteData);

      const { data, error } = await supabase
        .from('clientes')
        .update(clienteData)
        .eq('id', id)
        .eq('user_id', currentUser.user.id)
        .select()
        .single();

      if (error) {
        console.error("Erro na atualização do cliente:", error);
        throw error;
      }

      console.log("Cliente atualizado com sucesso:", data);
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
}
