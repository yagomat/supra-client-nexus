-- Otimizar rate limits para operações de cliente consolidadas
-- Ajustar limites para refletir a nova arquitetura unificada

-- Atualizar função de rate limit para operações consolidadas
CREATE OR REPLACE FUNCTION public.check_consolidated_rate_limit(
  p_user_id UUID,
  p_operation TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_time_window_minutes INTEGER DEFAULT 60
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
  v_result JSON;
BEGIN
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  -- Contar requests baseado na operação
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND event_type LIKE 'cliente_%'
    AND created_at > v_time_threshold;
  
  -- Verificar se está dentro do limite
  IF v_request_count < p_max_requests THEN
    v_result := json_build_object(
      'allowed', true,
      'current_requests', v_request_count,
      'max_requests', p_max_requests,
      'time_window_minutes', p_time_window_minutes,
      'reset_time', (v_time_threshold + INTERVAL '1 minute' * p_time_window_minutes),
      'operation', p_operation
    );
  ELSE
    v_result := json_build_object(
      'allowed', false,
      'current_requests', v_request_count,
      'max_requests', p_max_requests,
      'time_window_minutes', p_time_window_minutes,
      'reset_time', (v_time_threshold + INTERVAL '1 minute' * p_time_window_minutes),
      'operation', p_operation
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Criar índice otimizado para audit logs se não existir
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_type_created 
ON public.audit_logs (user_id, event_type, created_at);

-- Otimizar função de busca de clientes por status
CREATE OR REPLACE FUNCTION public.get_clientes_optimized(
  p_user_id UUID,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 1000
)
RETURNS SETOF clientes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log da operação para auditoria (rate limit)
  PERFORM public.log_audit_event(
    p_user_id,
    'cliente_list_optimized',
    json_build_object(
      'status_filter', p_status,
      'limit', p_limit,
      'timestamp', NOW()
    )::jsonb
  );

  IF p_status IS NULL OR p_status = 'todos' THEN
    RETURN QUERY 
      SELECT * FROM public.clientes 
      WHERE user_id = p_user_id
      ORDER BY nome
      LIMIT p_limit;
  ELSE
    RETURN QUERY 
      SELECT * FROM public.clientes 
      WHERE user_id = p_user_id
      AND status = p_status
      ORDER BY nome
      LIMIT p_limit;
  END IF;
END;
$$;