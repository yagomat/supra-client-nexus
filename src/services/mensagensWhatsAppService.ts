
import { supabase } from "@/integrations/supabase/client";

export interface MensagemWhatsApp {
  id: string;
  user_id: string;
  tipo_mensagem: 'a_vencer' | 'vence_hoje' | 'vencido' | 'pago' | string;
  mensagem: string;
  created_at: string;
  updated_at: string;
  is_template_padrao?: boolean;
  nome_template?: string;
}

export type TipoMensagem = 'a_vencer' | 'vence_hoje' | 'vencido' | 'pago';

export interface TemplatePersonalizado {
  id: string;
  tipo_mensagem: string;
  nome_template: string;
  mensagem: string;
  is_template_padrao: boolean;
}

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

export const getAllTemplates = async (): Promise<TemplatePersonalizado[]> => {
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

    const { data, error } = await supabase.rpc('get_templates_mensagens_whatsapp', {
      p_user_id: userId
    });

    if (error) {
      console.error("Erro ao buscar templates:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Erro em getAllTemplates:", error);
    throw error;
  }
};

export const addTemplatePersonalizado = async (
  nomeTemplate: string,
  mensagem: string
): Promise<void> => {
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

    const { data, error } = await supabase.rpc('add_template_personalizado', {
      p_user_id: userId,
      p_nome_template: nomeTemplate,
      p_mensagem: mensagem
    });

    if (error) {
      console.error("Erro ao adicionar template personalizado:", error);
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.message || 'Erro ao criar template personalizado');
    }

    console.log("Template personalizado criado com sucesso");
  } catch (error) {
    console.error("Erro em addTemplatePersonalizado:", error);
    throw error;
  }
};

export const deleteTemplatePersonalizado = async (templateId: string): Promise<void> => {
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

    const { data, error } = await supabase.rpc('delete_template_personalizado', {
      p_user_id: userId,
      p_template_id: templateId
    });

    if (error) {
      console.error("Erro ao deletar template personalizado:", error);
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.message || 'Erro ao deletar template personalizado');
    }

    console.log("Template personalizado deletado com sucesso");
  } catch (error) {
    console.error("Erro em deleteTemplatePersonalizado:", error);
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
