-- Função para verificar rate limiting específico de valores predefinidos
CREATE OR REPLACE FUNCTION public.check_valores_predefinidos_rate_limit(
  p_user_id UUID,
  p_operation TEXT,
  p_max_requests INTEGER DEFAULT 50,
  p_time_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular o timestamp limite
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  -- Contar requests no período para operações de valores predefinidos
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND event_type LIKE 'valores_predefinidos_%'
    AND event_type LIKE '%' || p_operation || '%'
    AND created_at > v_time_threshold;
  
  -- Retornar se está dentro do limite
  RETURN v_request_count < p_max_requests;
END;
$$;

-- Função para registrar operações de auditoria de valores predefinidos
CREATE OR REPLACE FUNCTION public.log_valores_predefinidos_operation(
  p_user_id UUID,
  p_operation TEXT,
  p_tipo TEXT,
  p_valor TEXT DEFAULT NULL,
  p_valores_count INTEGER DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    'valores_predefinidos_' || p_operation,
    jsonb_build_object(
      'operation', p_operation,
      'tipo', p_tipo,
      'valor', p_valor,
      'valores_count', p_valores_count,
      'timestamp', NOW()
    ),
    p_ip_address,
    NULL
  );
END;
$$;

-- Atualizar função add_valor_predefinido para incluir auditoria e rate limiting
CREATE OR REPLACE FUNCTION public.add_valor_predefinido(
  p_user_id UUID, 
  p_tipo TEXT, 
  p_valor TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_exists BOOLEAN;
BEGIN
  -- Verificar rate limiting
  IF NOT public.check_valores_predefinidos_rate_limit(p_user_id, 'add', 30, 60) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Limite de operações excedido. Tente novamente em alguns minutos.'
    );
  END IF;

  -- Verificar se já existe
  SELECT EXISTS(
    SELECT 1 FROM public.valores_predefinidos 
    WHERE user_id = p_user_id AND tipo = p_tipo AND valor = p_valor
  ) INTO v_exists;
  
  IF v_exists THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Valor já existe para este tipo'
    );
  END IF;
  
  -- Inserir novo valor
  INSERT INTO public.valores_predefinidos (user_id, tipo, valor)
  VALUES (p_user_id, p_tipo, p_valor);
  
  -- Registrar auditoria
  PERFORM public.log_valores_predefinidos_operation(
    p_user_id,
    'add',
    p_tipo,
    p_valor
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Valor adicionado com sucesso'
  );
END;
$$;

-- Atualizar função delete_valor_predefinido para incluir auditoria e rate limiting
CREATE OR REPLACE FUNCTION public.delete_valor_predefinido(
  p_user_id UUID, 
  p_tipo TEXT, 
  p_valor TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Verificar rate limiting
  IF NOT public.check_valores_predefinidos_rate_limit(p_user_id, 'delete', 50, 60) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Limite de operações excedido. Tente novamente em alguns minutos.'
    );
  END IF;

  -- Tentar deletar o valor
  DELETE FROM public.valores_predefinidos 
  WHERE user_id = p_user_id AND tipo = p_tipo AND valor = p_valor;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  IF v_deleted_count = 0 THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Valor não encontrado'
    );
  END IF;
  
  -- Registrar auditoria
  PERFORM public.log_valores_predefinidos_operation(
    p_user_id,
    'delete',
    p_tipo,
    p_valor
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'message', 'Valor excluído com sucesso'
  );
END;
$$;

-- Atualizar função import_valores_predefinidos para incluir auditoria e rate limiting
CREATE OR REPLACE FUNCTION public.import_valores_predefinidos(
  p_user_id UUID, 
  p_tipo TEXT, 
  p_valores TEXT[]
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_valor TEXT;
  v_importados INTEGER := 0;
  v_duplicados INTEGER := 0;
  v_invalidos INTEGER := 0;
  v_valores_invalidos TEXT[] := '{}';
  v_is_valid BOOLEAN;
BEGIN
  -- Verificar rate limiting para importação (mais restritivo)
  IF NOT public.check_valores_predefinidos_rate_limit(p_user_id, 'import', 5, 60) THEN
    RETURN json_build_object(
      'success', FALSE,
      'message', 'Limite de importações excedido. Tente novamente em alguns minutos.'
    );
  END IF;

  -- Processar cada valor
  FOREACH v_valor IN ARRAY p_valores
  LOOP
    -- Validar o valor
    SELECT public.validate_valor_predefinido(p_tipo, v_valor) INTO v_is_valid;
    
    IF NOT v_is_valid THEN
      v_invalidos := v_invalidos + 1;
      v_valores_invalidos := array_append(v_valores_invalidos, v_valor);
      CONTINUE;
    END IF;
    
    -- Tentar inserir, ignorando duplicados
    BEGIN
      INSERT INTO public.valores_predefinidos (user_id, tipo, valor)
      VALUES (p_user_id, p_tipo, v_valor);
      v_importados := v_importados + 1;
    EXCEPTION WHEN unique_violation THEN
      v_duplicados := v_duplicados + 1;
    END;
  END LOOP;
  
  -- Registrar auditoria
  PERFORM public.log_valores_predefinidos_operation(
    p_user_id,
    'import',
    p_tipo,
    NULL,
    v_importados
  );
  
  RETURN json_build_object(
    'success', v_importados > 0,
    'importados', v_importados,
    'duplicados', v_duplicados,
    'invalidos', v_invalidos,
    'valores_invalidos', v_valores_invalidos,
    'message', CASE 
      WHEN v_importados > 0 THEN 'Importação realizada com sucesso'
      ELSE 'Nenhum valor foi importado'
    END
  );
END;
$$;

-- Função para registrar tentativas de exportação
CREATE OR REPLACE FUNCTION public.log_valores_predefinidos_export(
  p_user_id UUID,
  p_tipo TEXT,
  p_count INTEGER
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar rate limiting para exportação
  IF NOT public.check_valores_predefinidos_rate_limit(p_user_id, 'export', 20, 60) THEN
    RAISE EXCEPTION 'Limite de exportações excedido. Tente novamente em alguns minutos.';
  END IF;

  -- Registrar auditoria
  PERFORM public.log_valores_predefinidos_operation(
    p_user_id,
    'export',
    p_tipo,
    NULL,
    p_count
  );
END;
$$;