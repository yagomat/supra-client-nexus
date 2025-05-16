
import { supabase } from "@/integrations/supabase/client";
import { Cliente, DashboardStats, Pagamento, ValoresPredefinidos } from "@/types";

// Clientes
export async function getClientes(): Promise<Cliente[]> {
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

// Pagamentos
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
  
  // A lógica de definir a data_pagamento agora é mais crítica com as novas regras de status
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

// Dashboard
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

export async function recalculateAllClientStatus(): Promise<void> {
  const { error } = await supabase.rpc('recalculate_all_client_status');
  
  if (error) {
    console.error("Erro ao recalcular status dos clientes:", error);
    throw error;
  }
}

// Valores Predefinidos
export async function getValoresPredefinidos(): Promise<ValoresPredefinidos> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data, error } = await supabase
    .from('valores_predefinidos')
    .select('*')
    .eq('user_id', currentUser.user.id);
    
  if (error) {
    console.error("Erro ao buscar valores predefinidos:", error);
    throw error;
  }
  
  // Processar os valores para o formato esperado
  const valoresPredefinidos: ValoresPredefinidos = {
    ufs: [],
    servidores: [],
    dias_vencimento: [],
    valores_plano: [],
    dispositivos_smart: [],
    aplicativos: []
  };
  
  if (data && data.length > 0) {
    data.forEach((item) => {
      const tipo = item.tipo as keyof ValoresPredefinidos;
      const valor = item.valor;
      
      if (tipo === 'dias_vencimento') {
        valoresPredefinidos[tipo].push(parseInt(valor));
      } else if (tipo === 'valores_plano') {
        valoresPredefinidos[tipo].push(parseFloat(valor));
      } else if (Object.keys(valoresPredefinidos).includes(tipo)) {
        (valoresPredefinidos[tipo] as string[]).push(valor);
      }
    });
    
    // Ordenar os valores
    valoresPredefinidos.ufs.sort();
    valoresPredefinidos.servidores.sort();
    valoresPredefinidos.dias_vencimento.sort((a, b) => a - b);
    valoresPredefinidos.valores_plano.sort((a, b) => a - b);
    valoresPredefinidos.dispositivos_smart.sort();
    valoresPredefinidos.aplicativos.sort();
  }
  
  return valoresPredefinidos;
}

export async function updateValoresPredefinidos(
  tipo: keyof ValoresPredefinidos, 
  valores: string[] | number[]
): Promise<void> {
  const { data: currentUser } = await supabase.auth.getUser();
  
  if (!currentUser.user) {
    throw new Error("Usuário não autenticado");
  }
  
  const userId = currentUser.user.id;
  
  // Primeiro, excluir todos os valores existentes deste tipo para este usuário
  const { error: deleteError } = await supabase
    .from('valores_predefinidos')
    .delete()
    .eq('user_id', userId)
    .eq('tipo', tipo);
    
  if (deleteError) {
    console.error(`Erro ao excluir valores predefinidos do tipo ${tipo}:`, deleteError);
    throw deleteError;
  }
  
  // Em seguida, inserir os novos valores
  if (valores.length > 0) {
    const valoresParaInserir = valores.map((valor) => ({
      user_id: userId,
      tipo,
      valor: valor.toString(),
    }));
    
    const { error: insertError } = await supabase
      .from('valores_predefinidos')
      .insert(valoresParaInserir);
      
    if (insertError) {
      console.error(`Erro ao inserir valores predefinidos do tipo ${tipo}:`, insertError);
      throw insertError;
    }
  }
}
