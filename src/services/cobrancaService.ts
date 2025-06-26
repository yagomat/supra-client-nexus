
import { supabase } from "@/integrations/supabase/client";

export interface FilaCobranca {
  cliente_id: string;
  cliente_nome: string;
  cliente_telefone: string | null;
  cliente_codigo_pais: string;
  cliente_servidor: string;
  cliente_status: string;
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
  try {
    const { data: currentUser, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Erro ao obter usuário:", userError);
      throw userError;
    }
    
    const userId = currentUser.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }
    
    console.log("Chamando RPC get_fila_cobranca com:", { userId, mes, ano });
    
    const { data, error } = await supabase.rpc('get_fila_cobranca', {
      p_user_id: userId,
      p_mes: mes,
      p_ano: ano
    });

    if (error) {
      console.error("Erro na RPC get_fila_cobranca:", error);
      throw error;
    }

    console.log(`Fila de cobrança carregada: ${data?.length || 0} clientes`);
    
    return data || [];
  } catch (error) {
    console.error("Erro em getFilaCobranca:", error);
    throw error;
  }
};

export const registrarCobranca = async (
  clienteId: string,
  tipoAviso: string,
  mes: number,
  ano: number
): Promise<void> => {
  try {
    const { data: currentUser, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Erro ao obter usuário em registrarCobranca:", userError);
      throw userError;
    }
    
    const userId = currentUser.user?.id;

    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

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
  } catch (error) {
    console.error("Erro em registrarCobranca:", error);
    throw error;
  }
};
