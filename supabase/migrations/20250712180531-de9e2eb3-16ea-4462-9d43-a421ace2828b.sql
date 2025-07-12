
-- Remover a função duplicada de log_audit_event que está causando conflito
DROP FUNCTION IF EXISTS public.log_audit_event(uuid, text, jsonb);

-- Manter apenas a versão mais completa com todos os parâmetros
-- Esta função já existe e funciona corretamente
-- Apenas garantindo que ela está otimizada para rate limiting

-- Criar função específica para rate limiting mais eficiente
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit_enhanced(
  p_identifier TEXT, -- email ou IP
  p_operation TEXT,
  p_max_requests INTEGER DEFAULT 5,
  p_time_window_minutes INTEGER DEFAULT 15
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
  v_next_allowed_attempt TIMESTAMP WITH TIME ZONE;
BEGIN
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  -- Contar tentativas recentes
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.audit_logs
  WHERE event_type = ('auth_' || p_operation || '_attempt')
    AND (details->>'email' = p_identifier OR ip_address = p_identifier)
    AND created_at > v_time_threshold;
  
  -- Calcular próxima tentativa permitida se excedido
  IF v_request_count >= p_max_requests THEN
    SELECT created_at + INTERVAL '1 minute' * p_time_window_minutes
    INTO v_next_allowed_attempt
    FROM public.audit_logs
    WHERE event_type = ('auth_' || p_operation || '_attempt')
      AND (details->>'email' = p_identifier OR ip_address = p_identifier)
      AND created_at > v_time_threshold
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
  
  RETURN json_build_object(
    'allowed', v_request_count < p_max_requests,
    'current_attempts', v_request_count,
    'max_attempts', p_max_requests,
    'window_minutes', p_time_window_minutes,
    'next_allowed_at', v_next_allowed_attempt,
    'remaining_attempts', GREATEST(0, p_max_requests - v_request_count)
  );
END;
$$;

-- Função para registrar tentativa com IP tracking
CREATE OR REPLACE FUNCTION public.log_auth_attempt_enhanced(
  p_email TEXT,
  p_operation TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Usar a função existente log_audit_event
  PERFORM public.log_audit_event(
    NULL::UUID, -- user_id null para tentativas de auth
    'auth_' || p_operation || '_attempt',
    jsonb_build_object(
      'email', p_email,
      'success', p_success,
      'error_message', p_error_message,
      'timestamp', NOW(),
      'operation', p_operation
    ),
    p_ip_address,
    p_user_agent
  );
END;
$$;

-- Função para rate limiting por IP (proteção adicional)
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
  p_ip_address TEXT,
  p_max_requests INTEGER DEFAULT 20,
  p_time_window_minutes INTEGER DEFAULT 5
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  IF p_ip_address IS NULL THEN
    RETURN TRUE; -- Permitir se não há IP
  END IF;
  
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.audit_logs
  WHERE ip_address = p_ip_address
    AND event_type LIKE 'auth_%'
    AND created_at > v_time_threshold;
  
  RETURN v_request_count < p_max_requests;
END;
$$;
