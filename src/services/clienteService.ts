
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";
import { ClientePasswordService } from "./clientePasswordService";

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
  // Usar o serviço de senhas para buscar com descriptografia automática
  const clienteWithPasswords = await ClientePasswordService.getClienteWithDecryptedPasswords(id);
  
  if (!clienteWithPasswords) {
    // Fallback para busca normal se a função RPC falhar
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
  
  return clienteWithPasswords;
}

export async function createCliente(cliente: Omit<Cliente, "id" | "created_at" | "status">): Promise<Cliente> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  // Preparar dados usando o serviço de senhas
  const preparedCliente = ClientePasswordService.prepareClienteForSubmission({
    ...cliente,
  });
  
  // Criar objeto compatível com o schema do banco, garantindo campos obrigatórios
  const clienteForDatabase = {
    user_id: currentUser.user.id,
    nome: preparedCliente.nome!,
    servidor: preparedCliente.servidor!,
    aplicativo: preparedCliente.aplicativo!,
    dia_vencimento: preparedCliente.dia_vencimento!,
    telefone: preparedCliente.telefone || null,
    codigo_pais_telefone: preparedCliente.codigo_pais_telefone || '+55',
    uf: preparedCliente.uf || null,
    valor_plano: preparedCliente.valor_plano || null,
    dispositivo_smart: preparedCliente.dispositivo_smart || null,
    usuario_aplicativo: preparedCliente.usuario_aplicativo || null,
    senha_aplicativo: preparedCliente.senha_aplicativo || null,
    data_licenca_aplicativo: preparedCliente.data_licenca_aplicativo || null,
    possui_tela_adicional: preparedCliente.possui_tela_adicional || false,
    dispositivo_smart_2: preparedCliente.dispositivo_smart_2 || null,
    aplicativo_2: preparedCliente.aplicativo_2 || null,
    usuario_2: preparedCliente.usuario_2 || null,
    senha_2: preparedCliente.senha_2 || null,
    data_licenca_2: preparedCliente.data_licenca_2 || null,
    observacoes: preparedCliente.observacoes || null,
  };
  
  const { data, error } = await supabase
    .from('clientes')
    .insert(clienteForDatabase)
    .select()
    .single();
    
  if (error) {
    console.error("Erro ao criar cliente:", error);
    throw error;
  }
  
  return data as Cliente;
}

export async function updateCliente(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
  // Preparar dados usando o serviço de senhas
  const preparedCliente = ClientePasswordService.prepareClienteForSubmission(cliente);
  
  const { data, error } = await supabase
    .from('clientes')
    .update(preparedCliente)
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
