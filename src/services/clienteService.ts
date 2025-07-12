
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

export async function getClientes(status?: "todos" | "ativo" | "inativo"): Promise<Cliente[]> {
  // Usar nossa nova função RPC filter_clientes_by_status
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
    // Caso não seja passado status, busca todos os clientes
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

export async function getCliente(id: string): Promise<Cliente> {
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

export async function createCliente(cliente: Omit<Cliente, "id" | "created_at" | "status">): Promise<Cliente> {
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

export async function updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
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

export async function deleteCliente(id: string): Promise<void> {
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
