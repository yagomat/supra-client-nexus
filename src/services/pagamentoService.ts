
import { supabase } from "@/integrations/supabase/client";
import { Pagamento } from "@/types";

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
