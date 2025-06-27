
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

    const { error } = await supabase
      .from('mensagens_whatsapp')
      .upsert({
        user_id: userId,
        tipo_mensagem: tipo,
        mensagem: mensagem,
        is_template_padrao: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,tipo_mensagem'
      });

    if (error) {
      console.error("Erro ao atualizar mensagem WhatsApp:", error);
      throw error;
    }

    console.log(`Mensagem ${tipo} atualizada com sucesso`);
  } catch (error) {
    console.error("Erro em updateMensagemWhatsApp:", error);
    throw error;
  }
};
