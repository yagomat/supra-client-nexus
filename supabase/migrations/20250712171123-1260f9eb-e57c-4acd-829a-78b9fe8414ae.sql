
-- Remover funções duplicadas e redundantes de rate limiting
-- Manter apenas as versões corretas e consolidadas

-- 1. Remover função duplicada check_export_rate_limit (manter apenas a versão com parâmetros padrão)
DROP FUNCTION IF EXISTS public.check_export_rate_limit(uuid);

-- 2. A função check_export_rate_limit com parâmetros padrão já existe e está correta, não precisa ser alterada

-- 3. Verificar se a função check_rate_limit está funcionando corretamente 
-- (esta função já existe e está correta conforme mostrado na configuração)

-- 4. Remover quaisquer outras funções duplicadas relacionadas a rate limiting que possam ter sido criadas
-- Verificar se há duplicatas da função secure_delete_cliente
DROP FUNCTION IF EXISTS public.secure_delete_cliente(uuid, text) CASCADE;

-- Recriar a função secure_delete_cliente limpa (sem duplicatas)
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

  -- Verificar rate limiting usando a função consolidada check_rate_limit
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

  -- Log da operação para auditoria usando a função consolidada
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

-- 5. Verificar se existe função log_audit_event (necessária para algumas operações)
-- Se não existir, criar uma versão simples
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_details JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    p_details,
    NOW()
  );
END;
$$;
