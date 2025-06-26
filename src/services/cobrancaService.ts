
import { supabase } from "@/integrations/supabase/client";

export interface FilaCobranca {
  cliente_id: string;
  cliente_nome: string;
  cliente_telefone: string | null;
  cliente_servidor: string;
  dia_vencimento: number;
  valor_plano: number | null;
  status_pagamento: string;
  data_proximo_pagamento: string;
  dias_para_vencimento: number;
  ultimo_aviso: string | null;
  data_ultimo_aviso: string | null;
  prioridade: number;
}

export const getFilaCobranca = async (mes: number, ano: number): Promise<FilaCobranca[]> => {
  console.log("getFilaCobranca chamado com:", { mes, ano });
  
  const { data: currentUser } = await supabase.auth.getUser();
  const userId = currentUser.user?.id;

  console.log("ID do usuário:", userId);

  if (!userId) {
    console.error("Usuário não autenticado");
    throw new Error("Usuário não autenticado");
  }

  console.log("Chamando função RPC get_fila_cobranca...");
  const { data, error } = await supabase.rpc('get_fila_cobranca', {
    p_user_id: userId,
    p_mes: mes,
    p_ano: ano
  });

  if (error) {
    console.error("Erro ao buscar fila de cobrança:", error);
    throw error;
  }

  console.log("Dados retornados pela função RPC:", data);
  return data || [];
};

export const registrarCobranca = async (
  clienteId: string,
  tipoAviso: string,
  mes: number,
  ano: number
): Promise<void> => {
  console.log("registrarCobranca chamado com:", { clienteId, tipoAviso, mes, ano });
  
  const { data: currentUser } = await supabase.auth.getUser();
  const userId = currentUser.user?.id;

  if (!userId) {
    console.error("Usuário não autenticado para registrar cobrança");
    throw new Error("Usuário não autenticado");
  }

  console.log("Chamando função RPC registrar_cobranca...");
  const { error } = await supabase.rpc('registrar_cobranca', {
    p_cliente_id: clienteId,
    p_user_id: userId,
    p_tipo_aviso: tipoAviso,
    p_mes: mes,
    p_ano: ano
  });

  if (error) {
    console.error("Erro ao registrar cobrança:", error);
    throw error;
  }

  console.log("Cobrança registrada com sucesso");
};
