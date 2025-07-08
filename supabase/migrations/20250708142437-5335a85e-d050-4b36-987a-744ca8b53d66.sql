-- Criar função segura para exclusão de clientes
CREATE OR REPLACE FUNCTION public.secure_delete_cliente(
  p_cliente_id UUID,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_cliente_record RECORD;
  v_deleted_pagamentos INTEGER := 0;
BEGIN
  -- Obter ID do usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Usuário não autenticado'
    );
  END IF;

  -- Verificar rate limiting - máximo 20 exclusões por hora
  IF NOT check_rate_limit(v_user_id, 'delete_cliente', 20, 60) THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Limite de exclusões excedido. Tente novamente em alguns minutos.'
    );
  END IF;

  -- Verificar se o cliente existe e pertence ao usuário
  SELECT * INTO v_cliente_record 
  FROM public.clientes 
  WHERE id = p_cliente_id AND user_id = v_user_id;
  
  IF v_cliente_record IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Cliente não encontrado ou não autorizado'
    );
  END IF;

  -- Excluir pagamentos associados primeiro
  DELETE FROM public.pagamentos 
  WHERE cliente_id = p_cliente_id;
  
  GET DIAGNOSTICS v_deleted_pagamentos = ROW_COUNT;

  -- Excluir cobrancas associadas
  DELETE FROM public.cliente_cobrancas 
  WHERE cliente_id = p_cliente_id;

  -- Excluir o cliente
  DELETE FROM public.clientes 
  WHERE id = p_cliente_id;

  -- Log da operação para auditoria
  PERFORM public.log_cliente_operation(
    v_user_id,
    'delete',
    p_cliente_id,
    to_jsonb(v_cliente_record),
    NULL,
    p_ip_address
  );

  RETURN json_build_object(
    'success', TRUE,
    'message', 'Cliente excluído com sucesso',
    'deleted_pagamentos', v_deleted_pagamentos
  );
END;
$$;

-- Adicionar rate limiting para exportação (função auxiliar)
CREATE OR REPLACE FUNCTION public.check_export_rate_limit(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN check_rate_limit(p_user_id, 'export_excel', 10, 60);
END;
$$;

-- Função para registrar tentativa de exportação
CREATE OR REPLACE FUNCTION public.log_export_attempt(p_user_id UUID, p_count INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.log_audit_event(
    p_user_id,
    'export_excel',
    json_build_object(
      'clientes_count', p_count,
      'timestamp', NOW()
    )::jsonb
  );
END;
$$;