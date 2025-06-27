
-- Adicionar coluna para indicar se é template padrão ou personalizado
ALTER TABLE public.mensagens_whatsapp 
ADD COLUMN IF NOT EXISTS is_template_padrao BOOLEAN DEFAULT FALSE;

-- Adicionar coluna para nome do template personalizado
ALTER TABLE public.mensagens_whatsapp 
ADD COLUMN IF NOT EXISTS nome_template TEXT;

-- Atualizar registros existentes para marcar como templates padrão
UPDATE public.mensagens_whatsapp 
SET is_template_padrao = TRUE 
WHERE tipo_mensagem IN ('a_vencer', 'vence_hoje', 'vencido', 'pago');

-- Criar função para obter todos os templates do usuário (padrão + personalizados)
CREATE OR REPLACE FUNCTION public.get_templates_mensagens_whatsapp(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  tipo_mensagem TEXT,
  nome_template TEXT,
  mensagem TEXT,
  is_template_padrao BOOLEAN
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.tipo_mensagem,
    CASE 
      WHEN m.is_template_padrao THEN 
        CASE m.tipo_mensagem
          WHEN 'a_vencer' THEN 'A Vencer'
          WHEN 'vence_hoje' THEN 'Vence Hoje'
          WHEN 'vencido' THEN 'Vencido'
          WHEN 'pago' THEN 'Pago'
          ELSE m.tipo_mensagem
        END
      ELSE m.nome_template
    END as nome_template,
    m.mensagem,
    m.is_template_padrao
  FROM public.mensagens_whatsapp m
  WHERE m.user_id = p_user_id
  ORDER BY m.is_template_padrao DESC, m.nome_template ASC;
END;
$$;

-- Criar função para adicionar template personalizado
CREATE OR REPLACE FUNCTION public.add_template_personalizado(
  p_user_id UUID,
  p_nome_template TEXT,
  p_mensagem TEXT
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_template_id UUID;
  v_tipo_personalizado TEXT;
BEGIN
  -- Gerar um tipo único para o template personalizado
  v_tipo_personalizado := 'custom_' || gen_random_uuid()::TEXT;
  
  -- Inserir o novo template
  INSERT INTO public.mensagens_whatsapp (
    user_id,
    tipo_mensagem,
    nome_template,
    mensagem,
    is_template_padrao
  ) VALUES (
    p_user_id,
    v_tipo_personalizado,
    p_nome_template,
    p_mensagem,
    FALSE
  ) RETURNING id INTO v_template_id;
  
  RETURN json_build_object(
    'success', TRUE,
    'template_id', v_template_id,
    'tipo_mensagem', v_tipo_personalizado,
    'message', 'Template personalizado criado com sucesso'
  );
END;
$$;

-- Criar função para deletar template personalizado
CREATE OR REPLACE FUNCTION public.delete_template_personalizado(
  p_user_id UUID,
  p_template_id UUID
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Deletar apenas templates personalizados (não padrão)
  DELETE FROM public.mensagens_whatsapp 
  WHERE id = p_template_id 
    AND user_id = p_user_id 
    AND is_template_padrao = FALSE;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  IF v_deleted_count > 0 THEN
    RETURN json_build_object(
      'success', TRUE,
      'message', 'Template personalizado deletado com sucesso'
    );
  ELSE
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Template não encontrado ou não pode ser deletado'
    );
  END IF;
END;
$$;
