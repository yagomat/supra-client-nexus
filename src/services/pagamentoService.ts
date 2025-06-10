
import { supabase } from "@/integrations/supabase/client";
import { Pagamento, Cliente } from "@/types";

// Interface para os dados retornados pela nova função
interface PagamentoComCliente {
  id: string;
  cliente_id: string;
  mes: number;
  ano: number;
  status: string;
  data_pagamento: string | null;
  created_at: string;
  updated_at: string | null;
  cliente_nome: string;
  cliente_created_at: string;
  cliente_dia_vencimento: number;
  cliente_valor_plano: number | null;
  cliente_status: string;
  cliente_telefone: string | null;
  cliente_uf: string | null;
  cliente_servidor: string;
  cliente_dispositivo_smart: string | null;
  cliente_aplicativo: string;
  cliente_usuario_aplicativo: string;
  cliente_senha_aplicativo: string;
  cliente_data_licenca_aplicativo: string | null;
  cliente_possui_tela_adicional: boolean;
  cliente_dispositivo_smart_2: string | null;
  cliente_aplicativo_2: string | null;
  cliente_usuario_2: string | null;
  cliente_senha_2: string | null;
  cliente_data_licenca_2: string | null;
  cliente_observacoes: string | null;
  cliente_user_id: string;
}

export async function getPagamentosWithClients(
  clienteId?: string, 
  mes?: number, 
  ano?: number, 
  status?: string,
  ordenacao: 'nome' | 'data' = 'data'
): Promise<{ pagamentos: Pagamento[], clientes: Cliente[] }> {
  // Usar nossa nova função RPC filter_pagamentos_with_clients
  const { data: currentUser } = await supabase.auth.getUser();
  const userId = currentUser.user?.id;
  
  const { data, error } = await supabase.rpc(
    'filter_pagamentos_with_clients', 
    { 
      p_cliente_id: clienteId || null,
      p_mes: mes || null,
      p_ano: ano || null,
      p_status: status || null,
      p_user_id: userId || null,
      p_ordem: ordenacao || 'data'
    }
  );
  
  if (error) {
    console.error("Erro ao buscar pagamentos com clientes:", error);
    throw error;
  }
  
  const rawData = data as PagamentoComCliente[] || [];
  
  // Converter e separar os dados
  const pagamentos: Pagamento[] = rawData.map(item => ({
    id: item.id,
    cliente_id: item.cliente_id,
    mes: item.mes,
    ano: item.ano,
    status: item.status,
    data_pagamento: item.data_pagamento,
    created_at: item.created_at
  }));
  
  // Extrair clientes únicos mantendo a ordem do backend
  const clientesMap = new Map<string, Cliente>();
  rawData.forEach(item => {
    if (!clientesMap.has(item.cliente_id)) {
      clientesMap.set(item.cliente_id, {
        id: item.cliente_id,
        created_at: item.cliente_created_at,
        nome: item.cliente_nome,
        telefone: item.cliente_telefone,
        uf: item.cliente_uf,
        servidor: item.cliente_servidor,
        dia_vencimento: item.cliente_dia_vencimento,
        valor_plano: item.cliente_valor_plano,
        dispositivo_smart: item.cliente_dispositivo_smart,
        aplicativo: item.cliente_aplicativo,
        usuario_aplicativo: item.cliente_usuario_aplicativo,
        senha_aplicativo: item.cliente_senha_aplicativo,
        data_licenca_aplicativo: item.cliente_data_licenca_aplicativo,
        possui_tela_adicional: item.cliente_possui_tela_adicional,
        dispositivo_smart_2: item.cliente_dispositivo_smart_2,
        aplicativo_2: item.cliente_aplicativo_2,
        usuario_2: item.cliente_usuario_2,
        senha_2: item.cliente_senha_2,
        data_licenca_2: item.cliente_data_licenca_2,
        observacoes: item.cliente_observacoes,
        status: item.cliente_status
      });
    }
  });
  
  // Manter a ordem dos clientes conforme retornada do backend
  const clientes: Cliente[] = [];
  const clientesVistos = new Set<string>();
  rawData.forEach(item => {
    if (!clientesVistos.has(item.cliente_id)) {
      clientesVistos.add(item.cliente_id);
      const cliente = clientesMap.get(item.cliente_id);
      if (cliente) {
        clientes.push(cliente);
      }
    }
  });
  
  return { pagamentos, clientes };
}

// Manter a função original para compatibilidade
export async function getPagamentos(
  clienteId?: string, 
  mes?: number, 
  ano?: number, 
  status?: string,
  ordenacao: 'nome' | 'data' = 'data'
): Promise<Pagamento[]> {
  const { pagamentos } = await getPagamentosWithClients(clienteId, mes, ano, status, ordenacao);
  return pagamentos;
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
