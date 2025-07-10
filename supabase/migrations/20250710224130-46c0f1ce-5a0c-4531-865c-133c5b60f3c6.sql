-- Fix check_export_rate_limit to count only export_excel events specifically
CREATE OR REPLACE FUNCTION public.check_export_rate_limit(p_user_id uuid, p_max_requests integer DEFAULT 50, p_time_window_minutes integer DEFAULT 60)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular o timestamp limite
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  -- Debug: Log da operação que está sendo verificada
  RAISE LOG 'Verificando rate limit de exportação para user_id: %, limite: %, janela: % minutos', 
    p_user_id, p_max_requests, p_time_window_minutes;
  
  -- Contar apenas logs de exportação específicos
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND event_type = 'export_excel'
    AND created_at > v_time_threshold;
    
  -- Debug: Log da contagem atual
  RAISE LOG 'Contagem atual de exportações para user_id %: % (limite: %)', 
    p_user_id, v_request_count, p_max_requests;
  
  -- Retornar se está dentro do limite
  RETURN v_request_count < p_max_requests;
END;
$function$;