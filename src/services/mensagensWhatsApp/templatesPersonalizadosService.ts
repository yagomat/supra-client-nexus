
import { supabase } from "@/integrations/supabase/client";
import { TemplatePersonalizado, RpcResponse } from "./types";

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

    // Gerar tipo único mais simples
    const tipoCustom = `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Tipo gerado:", tipoCustom);

    // Inserção direta simples
    const { data, error } = await supabase
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

    if (error) {
      console.error("Erro na inserção:", error);
      throw new Error(`Erro ao criar template: ${error.message}`);
    }

    console.log("Template criado com sucesso:", data);
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
