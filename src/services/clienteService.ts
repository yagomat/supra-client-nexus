
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

// Function to get all clients for the authenticated user
export async function getClientes(): Promise<Cliente[]> {
  const { data: clientes, error } = await supabase
    .from('clientes')
    .select('*')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("Erro ao buscar clientes:", error);
    throw error;
  }
  
  return clientes as Cliente[] || [];
}

export async function getClienteById(id: string): Promise<Cliente | undefined> {
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
    user_id: currentUser.user.id
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
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Erro ao excluir cliente:", error);
    throw error;
  }
}
