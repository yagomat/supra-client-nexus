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

interface RpcResponse {
  success: boolean;
  message: string;
  template_id?: string;
  tipo_mensagem?: string;
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

    console.log("Buscando templates para o usuário:", userId);

    const { data, error } = await supabase.rpc('get_templates_mensagens_whatsapp', {
      p_user_id: userId
    });

    if (error) {
      console.error("Erro ao buscar templates:", error);
      throw error;
    }

    console.log("Templates retornados:", data);
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

    console.log("Criando template personalizado:", { userId, nomeTemplate, mensagem });

    // Primeiro, vamos testar a constraint verificando se conseguimos inserir diretamente
    console.log("Tentando inserção direta primeiro...");
    
    const tipoCustom = `custom_${crypto.randomUUID()}`;
    console.log("Tipo gerado:", tipoCustom);

    const { data: insertData, error: insertError } = await supabase
      .from('mensagens_whatsapp')
      .insert({
        user_id: userId,
        tipo_mensagem: tipoCustom,
        nome_template: nomeTemplate,
        mensagem: mensagem,
        is_template_padrao: false
      })
      .select()
      .single();

    if (insertError) {
      console.error("Erro na inserção direta:", insertError);
      console.error("Código do erro:", insertError.code);
      console.error("Detalhes:", insertError.details);
      console.error("Mensagem:", insertError.message);
      
      // Se falhar por constraint, tentar via RPC como backup
      console.log("Tentando via RPC como fallback...");
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('add_template_personalizado', {
        p_user_id: userId,
        p_nome_template: nomeTemplate,
        p_mensagem: mensagem
      });

      if (rpcError) {
        console.error("Erro RPC ao adicionar template personalizado:", rpcError);
        console.error("Detalhes do erro RPC:", rpcError.message, rpcError.details, rpcError.hint);
        
        // Verificar se é problema de constraint
        if (rpcError.code === '23514') {
          throw new Error("Erro de configuração do banco de dados. A constraint precisa ser atualizada. Contate o administrador.");
        }
        
        throw new Error(`Erro ao criar template: ${rpcError.message}`);
      }

      console.log("Resposta da RPC:", rpcData);
      const response = rpcData as unknown as RpcResponse;

      if (!response?.success) {
        console.error("RPC retornou falha:", response);
        throw new Error(response?.message || 'Erro ao criar template personalizado via RPC');
      }

      console.log("Template personalizado criado com sucesso via RPC:", response);
      return;
    }

    console.log("Template criado com sucesso via inserção direta:", insertData);
  } catch (error) {
    console.error("Erro em addTemplatePersonalizado:", error);
    
    // Melhorar a mensagem de erro para o usuário
    if (error instanceof Error) {
      if (error.message.includes('constraint')) {
        throw new Error("Erro de configuração do sistema. Tente novamente em alguns minutos ou contate o suporte.");
      }
      throw error;
    }
    
    throw new Error("Erro desconhecido ao criar template personalizado");
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

    const response = data as unknown as RpcResponse;

    if (!response?.success) {
      throw new Error(response?.message || 'Erro ao deletar template personalizado');
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
