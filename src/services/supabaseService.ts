import { supabase } from "@/integrations/supabase/client";
import { Cliente, Pagamento, DashboardStats, ValoresPredefinidos } from "@/types";

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

export async function getPagamentos(clienteId?: string): Promise<Pagamento[]> {
  let query = supabase.from('pagamentos').select('*');
  
  if (clienteId) {
    query = query.eq('cliente_id', clienteId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Erro ao buscar pagamentos:", error);
    throw error;
  }
  
  return data as Pagamento[] || [];
}

export async function createPagamento(pagamento: Omit<Pagamento, "id" | "created_at">): Promise<Pagamento> {
  const { data, error } = await supabase
    .from('pagamentos')
    .insert([pagamento])
    .select()
    .single();
    
  if (error) {
    console.error("Erro ao criar pagamento:", error);
    throw error;
  }
  
  return data as Pagamento;
}

export async function updatePagamento(id: string, status: string, data_pagamento: string | null = null): Promise<Pagamento> {
  const updateData: any = { status };
  
  if (status !== "nao_pago" && data_pagamento === null) {
    updateData.data_pagamento = new Date().toISOString();
  } else if (data_pagamento !== null) {
    updateData.data_pagamento = data_pagamento;
  }
  
  const { data, error } = await supabase
    .from('pagamentos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Erro ao atualizar pagamento:", error);
    throw error;
  }
  
  return data as Pagamento;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data, error } = await supabase.rpc(
    'get_dashboard_stats', 
    { user_id_param: currentUser.user.id }
  );
  
  if (error) {
    console.error("Erro ao buscar estatísticas:", error);
    throw error;
  }
  
  return data as unknown as DashboardStats;
}

export async function getValoresPredefinidos(): Promise<ValoresPredefinidos> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data: valoresSalvos, error } = await supabase
    .from('valores_predefinidos')
    .select('*')
    .eq('user_id', currentUser.user.id);
    
  if (error) {
    console.error("Erro ao buscar valores predefinidos:", error);
    throw error;
  }
  
  // Transform the flat list into the expected structure
  const result: ValoresPredefinidos = {
    ufs: [],
    servidores: [],
    dias_vencimento: [],
    valores_plano: [],
    dispositivos_smart: [],
    aplicativos: []
  };
  
  // Process the values from the database
  if (valoresSalvos && valoresSalvos.length > 0) {
    valoresSalvos.forEach(item => {
      const tipo = item.tipo as keyof ValoresPredefinidos;
      const valor = item.valor;
      
      if (tipo === 'dias_vencimento' || tipo === 'valores_plano') {
        const numValue = parseFloat(valor);
        if (!isNaN(numValue)) {
          (result[tipo] as number[]).push(numValue);
        }
      } else {
        (result[tipo] as string[]).push(valor);
      }
    });
  }
  
  // Add default values if no stored values are found
  if (result.ufs.length === 0) {
    result.ufs = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];
  }
  
  if (result.servidores.length === 0) {
    result.servidores = ["Servidor A", "Servidor B", "Servidor C", "Servidor D", "Servidor E"];
  }
  
  if (result.dias_vencimento.length === 0) {
    result.dias_vencimento = [1, 5, 10, 15, 20, 25, 30];
  }
  
  if (result.valores_plano.length === 0) {
    result.valores_plano = [29.90, 39.90, 49.90, 59.90, 69.90, 79.90, 89.90, 99.90];
  }
  
  if (result.dispositivos_smart.length === 0) {
    result.dispositivos_smart = ["Smart TV Samsung", "Smart TV LG", "Smart TV TCL", "Amazon Fire Stick", "Apple TV", "Chromecast", "Roku", "Smartphone", "Tablet", "Computador"];
  }
  
  if (result.aplicativos.length === 0) {
    result.aplicativos = ["NetflixHD", "DisneyPlus", "PrimeVideo", "HBO Max", "Star+", "Paramount+", "Apple TV+", "MAX", "Globoplay"];
  }
  
  return result;
}

export async function updateValoresPredefinidos(campo: keyof ValoresPredefinidos, valores: string[] | number[]): Promise<ValoresPredefinidos> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  // Delete existing values for this field
  const { error: deleteError } = await supabase
    .from('valores_predefinidos')
    .delete()
    .eq('user_id', currentUser.user.id)
    .eq('tipo', campo);
    
  if (deleteError) {
    console.error("Erro ao deletar valores predefinidos:", deleteError);
    throw deleteError;
  }
  
  // Insert new values
  const valuesToInsert = valores.map(valor => ({
    user_id: currentUser.user!.id,
    tipo: campo,
    valor: valor.toString()
  }));
  
  const { error: insertError } = await supabase
    .from('valores_predefinidos')
    .insert(valuesToInsert);
    
  if (insertError) {
    console.error("Erro ao inserir valores predefinidos:", insertError);
    throw insertError;
  }
  
  // Get updated values
  return getValoresPredefinidos();
}
