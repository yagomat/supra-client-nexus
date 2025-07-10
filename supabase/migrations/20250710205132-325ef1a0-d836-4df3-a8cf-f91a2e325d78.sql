-- Função para buscar clientes paginados com opção de dados sensíveis
CREATE OR REPLACE FUNCTION public.get_clientes_paginated(
  p_user_id UUID,
  p_page INTEGER DEFAULT 1,
  p_limit INTEGER DEFAULT 50,
  p_include_sensitive BOOLEAN DEFAULT FALSE,
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'todos'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_offset INTEGER;
  v_total_count INTEGER;
  v_clientes JSON;
  v_base_query TEXT;
  v_count_query TEXT;
  v_sensitive_fields TEXT;
BEGIN
  -- Validar limites
  IF p_limit > 100 THEN
    p_limit := 100;
  END IF;
  
  IF p_limit < 1 THEN
    p_limit := 10;
  END IF;
  
  v_offset := (p_page - 1) * p_limit;
  
  -- Campos sensíveis (apenas se solicitado)
  IF p_include_sensitive THEN
    v_sensitive_fields := ', senha_aplicativo, senha_2, usuario_aplicativo, usuario_2, observacoes';
  ELSE
    v_sensitive_fields := ', ''***'' as senha_aplicativo, NULL as senha_2, usuario_aplicativo, ''***'' as usuario_2, NULL as observacoes';
  END IF;
  
  -- Query base
  v_base_query := 'SELECT 
    id, nome, telefone, codigo_pais_telefone, uf, servidor, 
    dia_vencimento, valor_plano, dispositivo_smart, aplicativo,
    data_licenca_aplicativo, possui_tela_adicional, dispositivo_smart_2,
    aplicativo_2, data_licenca_2, status, created_at, user_id' || 
    v_sensitive_fields || '
    FROM public.clientes 
    WHERE user_id = $1';
    
  v_count_query := 'SELECT COUNT(*) FROM public.clientes WHERE user_id = $1';
  
  -- Filtros adicionais
  IF p_status != 'todos' THEN
    v_base_query := v_base_query || ' AND status = ''' || p_status || '''';
    v_count_query := v_count_query || ' AND status = ''' || p_status || '''';
  END IF;
  
  IF p_search IS NOT NULL AND LENGTH(TRIM(p_search)) > 0 THEN
    v_base_query := v_base_query || ' AND (nome ILIKE ''%' || p_search || '%'' OR servidor ILIKE ''%' || p_search || '%'')';
    v_count_query := v_count_query || ' AND (nome ILIKE ''%' || p_search || '%'' OR servidor ILIKE ''%' || p_search || '%'')';
  END IF;
  
  -- Ordenação e paginação
  v_base_query := v_base_query || ' ORDER BY nome ASC LIMIT $2 OFFSET $3';
  
  -- Contar total
  EXECUTE v_count_query USING p_user_id INTO v_total_count;
  
  -- Buscar dados
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || v_base_query || ') t' 
    USING p_user_id, p_limit, v_offset INTO v_clientes;
  
  -- Log da operação para auditoria
  PERFORM public.log_audit_event(
    p_user_id,
    CASE WHEN p_include_sensitive THEN 'clientes_paginated_sensitive' ELSE 'clientes_paginated_basic' END,
    json_build_object(
      'page', p_page,
      'limit', p_limit,
      'total_count', v_total_count,
      'include_sensitive', p_include_sensitive,
      'search', p_search,
      'status', p_status
    )::jsonb
  );
  
  RETURN json_build_object(
    'data', COALESCE(v_clientes, '[]'::json),
    'pagination', json_build_object(
      'page', p_page,
      'limit', p_limit,
      'total', v_total_count,
      'total_pages', CEIL(v_total_count::float / p_limit),
      'has_next', (v_offset + p_limit) < v_total_count,
      'has_prev', p_page > 1
    )
  );
END;
$$;

-- Função para buscar dados sensíveis específicos de um cliente
CREATE OR REPLACE FUNCTION public.get_cliente_sensitive_data(
  p_user_id UUID,
  p_cliente_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente_data JSON;
BEGIN
  -- Verificar se o cliente pertence ao usuário
  IF NOT public.cliente_pertence_ao_usuario(p_cliente_id) THEN
    RETURN json_build_object('error', 'Cliente não encontrado ou não autorizado');
  END IF;
  
  -- Buscar dados sensíveis
  SELECT json_build_object(
    'id', id,
    'senha_aplicativo', senha_aplicativo,
    'senha_2', senha_2,
    'usuario_aplicativo', usuario_aplicativo,
    'usuario_2', usuario_2,
    'observacoes', observacoes
  )
  INTO v_cliente_data
  FROM public.clientes
  WHERE id = p_cliente_id AND user_id = p_user_id;
  
  -- Log da operação para auditoria de segurança
  PERFORM public.log_audit_event(
    p_user_id,
    'cliente_sensitive_data_access',
    json_build_object(
      'cliente_id', p_cliente_id,
      'timestamp', NOW()
    )::jsonb
  );
  
  RETURN COALESCE(v_cliente_data, json_build_object('error', 'Cliente não encontrado'));
END;
$$;

-- Função para controle de rate limiting específico para buscas
CREATE OR REPLACE FUNCTION public.check_search_rate_limit(
  p_user_id UUID,
  p_max_requests INTEGER DEFAULT 30,
  p_time_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND event_type LIKE 'clientes_paginated_%'
    AND created_at > v_time_threshold;
  
  RETURN v_request_count < p_max_requests;
END;
$$;

-- Função para auditoria detalhada de acesso a dados sensíveis
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access(
  p_user_id UUID,
  p_operation TEXT,
  p_cliente_id UUID DEFAULT NULL,
  p_data_type TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
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
    ip_address
  ) VALUES (
    p_user_id,
    'sensitive_data_' || p_operation,
    json_build_object(
      'cliente_id', p_cliente_id,
      'data_type', p_data_type,
      'operation', p_operation,
      'timestamp', NOW(),
      'risk_level', CASE 
        WHEN p_data_type IN ('senha_aplicativo', 'senha_2') THEN 'HIGH'
        WHEN p_data_type IN ('observacoes', 'usuario_aplicativo') THEN 'MEDIUM'
        ELSE 'LOW'
      END
    )::jsonb,
    p_ip_address
  );
END;
$$;