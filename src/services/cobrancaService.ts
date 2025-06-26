
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
  console.log("=== INÍCIO getFilaCobranca ===");
  console.log("Parâmetros recebidos:", { mes, ano });
  
  try {
    const { data: currentUser, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Erro ao obter usuário:", userError);
      throw userError;
    }
    
    const userId = currentUser.user?.id;
    console.log("ID do usuário obtido:", userId);

    if (!userId) {
      console.error("Usuário não autenticado - userId é null/undefined");
      throw new Error("Usuário não autenticado");
    }

    console.log("Preparando chamada RPC get_fila_cobranca...");
    console.log("Parâmetros da RPC:", {
      p_user_id: userId,
      p_mes: mes,
      p_ano: ano
    });
    
    const { data, error } = await supabase.rpc('get_fila_cobranca', {
      p_user_id: userId,
      p_mes: mes,
      p_ano: ano
    });

    if (error) {
      console.error("=== ERRO NA RPC ===");
      console.error("Código do erro:", error.code);
      console.error("Mensagem do erro:", error.message);
      console.error("Detalhes do erro:", error.details);
      console.error("Hint do erro:", error.hint);
      console.error("Objeto de erro completo:", error);
      throw error;
    }

    console.log("=== SUCESSO NA RPC ===");
    console.log("Tipo dos dados retornados:", typeof data);
    console.log("Dados são array?:", Array.isArray(data));
    console.log("Quantidade de registros:", data?.length || 0);
    console.log("Primeiros 3 registros:", data?.slice(0, 3));
    
    const result = data || [];
    console.log("=== FIM getFilaCobranca - RETORNANDO ===");
    console.log("Resultado final:", result);
    
    return result;
  } catch (error) {
    console.error("=== ERRO CAPTURADO EM getFilaCobranca ===");
    console.error("Tipo do erro:", typeof error);
    console.error("Erro completo:", error);
    throw error;
  }
};

export const registrarCobranca = async (
  clienteId: string,
  tipoAviso: string,
  mes: number,
  ano: number
): Promise<void> => {
  console.log("=== INÍCIO registrarCobranca ===");
  console.log("Parâmetros:", { clienteId, tipoAviso, mes, ano });
  
  try {
    const { data: currentUser, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Erro ao obter usuário em registrarCobranca:", userError);
      throw userError;
    }
    
    const userId = currentUser.user?.id;

    if (!userId) {
      console.error("Usuário não autenticado para registrar cobrança");
      throw new Error("Usuário não autenticado");
    }

    console.log("Chamando RPC registrar_cobranca...");
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

    console.log("=== SUCESSO registrarCobranca ===");
  } catch (error) {
    console.error("=== ERRO CAPTURADO EM registrarCobranca ===");
    console.error("Erro completo:", error);
    throw error;
  }
};
