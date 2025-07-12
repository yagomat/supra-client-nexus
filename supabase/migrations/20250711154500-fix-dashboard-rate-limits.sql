
-- Increase dashboard rate limits to allow normal usage
CREATE OR REPLACE FUNCTION public.check_dashboard_rate_limit(p_user_id uuid, p_max_requests integer DEFAULT 50, p_time_window_minutes integer DEFAULT 5)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  -- Log current usage for debugging
  RAISE LOG 'Dashboard rate limit check for user %: % requests in % minutes (limit: %)', 
    p_user_id, v_request_count, p_time_window_minutes, p_max_requests;
  
  RETURN v_request_count < p_max_requests;
END;
$function$;

-- Update the dashboard functions to use the new more permissive limits
CREATE OR REPLACE FUNCTION public.get_dashboard_critical_stats(user_id_param uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  stats JSON;
  clientes_ativos INTEGER;
  clientes_inativos INTEGER;
  clientes_novos INTEGER;
  pagamentos_pendentes INTEGER;
  valor_recebido_mes NUMERIC;
  clientes_inativos_proximos_dias INTEGER;
  apps_vencendo_proximos_dias JSON;
  clientes_em_risco_detalhes JSON;
BEGIN
  -- Check rate limiting with more permissive limits (50 requests per 5 minutes)
  IF NOT public.check_dashboard_rate_limit(user_id_param, 50, 5) THEN
    RAISE EXCEPTION 'Rate limit exceeded for dashboard requests. Please wait a moment.';
  END IF;

  -- Log the request for audit using the consolidated function
  PERFORM public.log_audit_event(
    user_id_param,
    'dashboard_stats_request',
    json_build_object('timestamp', NOW(), 'type', 'critical')::jsonb
  );

  -- Count active clients
  SELECT COUNT(*) INTO clientes_ativos 
  FROM public.clientes 
  WHERE user_id = user_id_param AND status = 'ativo';
  
  -- Count inactive clients
  SELECT COUNT(*) INTO clientes_inativos 
  FROM public.clientes 
  WHERE user_id = user_id_param AND status = 'inativo';
  
  -- Count new clients (last 30 days)
  SELECT COUNT(*) INTO clientes_novos 
  FROM public.clientes 
  WHERE user_id = user_id_param AND created_at >= (CURRENT_DATE - INTERVAL '30 days');

  -- Count pending payments (current month)
  SELECT COUNT(*) INTO pagamentos_pendentes
  FROM public.clientes c
  LEFT JOIN public.pagamentos p ON 
    c.id = p.cliente_id AND 
    p.mes = EXTRACT(MONTH FROM CURRENT_DATE) AND 
    p.ano = EXTRACT(YEAR FROM CURRENT_DATE) AND
    p.status IN ('pago', 'pago_confianca')
  WHERE c.user_id = user_id_param AND 
        c.status = 'ativo' AND
        p.id IS NULL;
  
  -- Calculate total value received in current month
  SELECT COALESCE(SUM(c.valor_plano), 0) INTO valor_recebido_mes
  FROM public.clientes c
  JOIN public.pagamentos p ON 
    c.id = p.cliente_id AND 
    p.mes = EXTRACT(MONTH FROM CURRENT_DATE) AND 
    p.ano = EXTRACT(YEAR FROM CURRENT_DATE) AND
    p.status IN ('pago', 'pago_confianca')
  WHERE c.user_id = user_id_param;

  -- Count clients that will become inactive in the next 3 days
  SELECT COUNT(*) INTO clientes_inativos_proximos_dias
  FROM public.clientes c
  LEFT JOIN public.pagamentos p_atual ON 
    c.id = p_atual.cliente_id AND 
    p_atual.mes = EXTRACT(MONTH FROM CURRENT_DATE) AND 
    p_atual.ano = EXTRACT(YEAR FROM CURRENT_DATE) AND
    p_atual.status IN ('pago', 'pago_confianca')
  JOIN public.pagamentos p_anterior ON
    c.id = p_anterior.cliente_id AND
    ((EXTRACT(MONTH FROM CURRENT_DATE) = 1 AND p_anterior.mes = 12 AND p_anterior.ano = EXTRACT(YEAR FROM CURRENT_DATE) - 1) OR
     (EXTRACT(MONTH FROM CURRENT_DATE) > 1 AND p_anterior.mes = EXTRACT(MONTH FROM CURRENT_DATE) - 1 AND p_anterior.ano = EXTRACT(YEAR FROM CURRENT_DATE))) AND
    p_anterior.status IN ('pago', 'pago_confianca')
  WHERE 
    c.user_id = user_id_param AND 
    c.status = 'ativo' AND 
    p_atual.id IS NULL AND
    c.dia_vencimento BETWEEN EXTRACT(DAY FROM CURRENT_DATE) AND EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '3 days');

  -- Get clients with apps expiring in the next 30 days
  WITH apps_vencendo AS (
    SELECT 
      c.id,
      c.nome,
      c.aplicativo,
      c.data_licenca_aplicativo AS data_vencimento,
      'principal' AS tipo_tela,
      (c.data_licenca_aplicativo - CURRENT_DATE) AS dias_restantes
    FROM public.clientes c
    WHERE 
      c.user_id = user_id_param AND
      c.data_licenca_aplicativo IS NOT NULL AND
      c.data_licenca_aplicativo BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
    
    UNION ALL
    
    SELECT 
      c.id,
      c.nome,
      c.aplicativo_2 AS aplicativo,
      c.data_licenca_2 AS data_vencimento,
      'adicional' AS tipo_tela,
      (c.data_licenca_2 - CURRENT_DATE) AS dias_restantes
    FROM public.clientes c
    WHERE 
      c.user_id = user_id_param AND
      c.possui_tela_adicional = true AND
      c.data_licenca_2 IS NOT NULL AND
      c.data_licenca_2 BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '30 days')
  )
  SELECT json_agg(json_build_object(
    'id', id,
    'nome', nome,
    'aplicativo', aplicativo,
    'data_vencimento', data_vencimento,
    'tipo_tela', tipo_tela,
    'dias_restantes', dias_restantes
  ) ORDER BY dias_restantes ASC)
  INTO apps_vencendo_proximos_dias
  FROM apps_vencendo;

  -- Get detailed client risk information
  WITH clientes_em_risco AS (
    SELECT 
      c.id,
      c.nome,
      c.servidor,
      (c.dia_vencimento - EXTRACT(DAY FROM CURRENT_DATE)) AS dias_restantes
    FROM public.clientes c
    LEFT JOIN public.pagamentos p_atual ON 
      c.id = p_atual.cliente_id AND 
      p_atual.mes = EXTRACT(MONTH FROM CURRENT_DATE) AND 
      p_atual.ano = EXTRACT(YEAR FROM CURRENT_DATE) AND
      p_atual.status IN ('pago', 'pago_confianca')
    JOIN public.pagamentos p_anterior ON
      c.id = p_anterior.cliente_id AND
      ((EXTRACT(MONTH FROM CURRENT_DATE) = 1 AND p_anterior.mes = 12 AND p_anterior.ano = EXTRACT(YEAR FROM CURRENT_DATE) - 1) OR
       (EXTRACT(MONTH FROM CURRENT_DATE) > 1 AND p_anterior.mes = EXTRACT(MONTH FROM CURRENT_DATE) - 1 AND p_anterior.ano = EXTRACT(YEAR FROM CURRENT_DATE))) AND
      p_anterior.status IN ('pago', 'pago_confianca')
    WHERE 
      c.user_id = user_id_param AND 
      c.status = 'ativo' AND 
      p_atual.id IS NULL AND
      EXTRACT(DAY FROM CURRENT_DATE) <= c.dia_vencimento AND
      (c.dia_vencimento - EXTRACT(DAY FROM CURRENT_DATE)) <= 3
  )
  SELECT json_agg(json_build_object(
    'id', id,
    'nome', nome,
    'servidor', servidor,
    'dias_restantes', dias_restantes
  ) ORDER BY dias_restantes ASC)
  INTO clientes_em_risco_detalhes
  FROM clientes_em_risco;

  -- Build the critical stats object
  stats := json_build_object(
    'clientes_ativos', clientes_ativos,
    'clientes_inativos', clientes_inativos,
    'clientes_novos', clientes_novos,
    'clientes_total', clientes_ativos + clientes_inativos,
    'pagamentos_pendentes', pagamentos_pendentes,
    'valor_recebido_mes', valor_recebido_mes,
    'clientes_inativos_proximos_dias', clientes_inativos_proximos_dias,
    'apps_vencendo_proximos_dias', apps_vencendo_proximos_dias,
    'clientes_em_risco_detalhes', clientes_em_risco_detalhes
  );
  
  RETURN stats;
END;
$function$;

-- Clean up old dashboard request logs to improve performance
DELETE FROM public.audit_logs 
WHERE event_type = 'dashboard_stats_request' 
AND created_at < NOW() - INTERVAL '1 hour';
