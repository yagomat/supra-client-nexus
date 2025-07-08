
import { supabase } from "@/integrations/supabase/client";
import { TipoMensagem } from "./types";

export const getMensagensWhatsApp = async (): Promise<Record<TipoMensagem, string>> => {
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

    const { data, error } = await supabase
      .from('mensagens_whatsapp')
      .select('*')
      .eq('user_id', userId)
      .eq('is_template_padrao', true);

    if (error) {
      console.error("Erro ao buscar mensagens WhatsApp:", error);
      throw error;
    }

    // Converter array em objeto indexado por tipo
    const mensagens: Record<TipoMensagem, string> = {
      a_vencer: '',
      vence_hoje: '',
      vencido: '',
      pago: ''
    };

    data?.forEach((msg) => {
      if (['a_vencer', 'vence_hoje', 'vencido', 'pago'].includes(msg.tipo_mensagem)) {
        mensagens[msg.tipo_mensagem as TipoMensagem] = msg.mensagem;
      }
    });

    return mensagens;
  } catch (error) {
    console.error("Erro em getMensagensWhatsApp:", error);
    throw error;
  }
};

export const updateMensagemWhatsApp = async (tipo: TipoMensagem, mensagem: string): Promise<void> => {
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

    // Usar função segura com validação e auditoria
    const { data: result, error } = await supabase.rpc('secure_update_template', {
      p_user_id: userId,
      p_tipo: tipo,
      p_mensagem: mensagem
    });

    if (error) {
      console.error("Erro ao atualizar template:", error);
      throw error;
    }

    const typedResult = result as { success: boolean; error?: string; validation?: any };
    
    if (!typedResult.success) {
      if (typedResult.error?.includes('Limite de')) {
        throw new Error(`Rate limit: ${typedResult.error}`);
      } else if (typedResult.validation?.errors?.length > 0) {
        throw new Error(`Validação: ${typedResult.validation.errors.join(', ')}`);
      } else {
        throw new Error(typedResult.error || 'Erro desconhecido');
      }
    }

    console.log(`Template ${tipo} atualizado com sucesso e auditado`);
  } catch (error) {
    console.error("Erro em updateMensagemWhatsApp:", error);
    throw error;
  }
};
