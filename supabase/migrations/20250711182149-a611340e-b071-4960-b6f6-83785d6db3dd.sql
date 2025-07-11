-- Ajustar o rate limit do dashboard para ser menos restritivo
-- Aumentar limite de 10 por minuto para 15 por 5 minutos

CREATE OR REPLACE FUNCTION public.check_dashboard_rate_limit(
  p_user_id uuid, 
  p_max_requests integer DEFAULT 15, 
  p_time_window_minutes integer DEFAULT 5
)
RETURNS boolean
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
    AND event_type = 'dashboard_stats_request'
    AND created_at > v_time_threshold;
  
  RETURN v_request_count < p_max_requests;
END;
$$;