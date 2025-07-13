
-- Aumentar significativamente os limites de rate limiting para login
-- e reduzir a janela de tempo para ser menos restritivo

-- Atualizar função de rate limiting para ser mais permissiva
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit_enhanced(
  p_identifier TEXT,
  p_operation TEXT,
  p_max_requests INTEGER DEFAULT 50, -- Aumentado de 5 para 50
  p_time_window_minutes INTEGER DEFAULT 5 -- Reduzido de 15 para 5 minutos
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
  v_next_allowed_at TIMESTAMP WITH TIME ZONE;
BEGIN
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  -- Contar tentativas no período
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.audit_logs
  WHERE event_type = ('auth_' || p_operation || '_attempt')
    AND (details->>'email' = p_identifier OR details->>'identifier' = p_identifier)
    AND created_at > v_time_threshold;
  
  -- Calcular quando será permitido novamente
  IF v_request_count >= p_max_requests THEN
    SELECT created_at + INTERVAL '1 minute' * p_time_window_minutes
    INTO v_next_allowed_at
    FROM public.audit_logs
    WHERE event_type = ('auth_' || p_operation || '_attempt')
      AND (details->>'email' = p_identifier OR details->>'identifier' = p_identifier)
      AND created_at > v_time_threshold
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
  
  RETURN json_build_object(
    'allowed', v_request_count < p_max_requests,
    'current_attempts', v_request_count,
    'max_attempts', p_max_requests,
    'window_minutes', p_time_window_minutes,
    'next_allowed_at', v_next_allowed_at,
    'remaining_attempts', GREATEST(0, p_max_requests - v_request_count)
  );
END;
$$;

-- Atualizar função básica de rate limiting também
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
  p_email TEXT,
  p_operation TEXT,
  p_max_requests INTEGER DEFAULT 50, -- Aumentado de 5 para 50
  p_time_window_minutes INTEGER DEFAULT 5 -- Reduzido de 15 para 5 minutos
) RETURNS BOOLEAN
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
  WHERE event_type = ('auth_' || p_operation || '_attempt')
    AND details->>'email' = p_email
    AND created_at > v_time_threshold;
  
  RETURN v_request_count < p_max_requests;
END;
$$;

-- Atualizar função de rate limiting por IP para ser mais permissiva
CREATE OR REPLACE FUNCTION public.check_ip_rate_limit(
  p_ip_address TEXT,
  p_max_requests INTEGER DEFAULT 100, -- Aumentado de 20 para 100
  p_time_window_minutes INTEGER DEFAULT 5 -- Mantido em 5 minutos
) RETURNS BOOLEAN
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
  WHERE ip_address = p_ip_address
    AND event_type LIKE 'auth_%'
    AND created_at > v_time_threshold;
  
  RETURN v_request_count < p_max_requests;
END;
$$;

-- Limpar logs antigos de rate limiting para começar com slate limpo
DELETE FROM public.audit_logs 
WHERE event_type LIKE 'auth_%_attempt' 
AND created_at < (NOW() - INTERVAL '1 hour');
