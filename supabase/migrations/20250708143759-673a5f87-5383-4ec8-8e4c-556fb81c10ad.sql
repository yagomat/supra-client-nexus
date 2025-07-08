-- Atualizar get_dashboard_stats para incluir clientes_em_risco_detalhes no backend
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(user_id_param uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  stats JSON;
  clientes_ativos INTEGER;
  clientes_inativos INTEGER;
  clientes_novos INTEGER;
  evolucao_clientes JSON;
  distribuicao_dispositivos JSON;
  distribuicao_aplicativos JSON;
  distribuicao_ufs JSON;
  distribuicao_servidores JSON;
  pagamentos_pendentes INTEGER;
  valor_recebido_mes NUMERIC;
  pagamentos_por_mes JSON;
  clientes_inativos_proximos_dias INTEGER;
  apps_vencendo_proximos_dias JSON;
  clientes_em_risco_detalhes JSON;
BEGIN
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
  
  -- Get client evolution over last 12 months, considering payment status
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE) - interval '11 month',
      date_trunc('month', CURRENT_DATE),
      interval '1 month'
    ) AS month_date
  ),
  monthly_active_clients AS (
    SELECT 
      to_char(m.month_date, 'Mon/YY') AS mes,
      COUNT(DISTINCT c.id) AS quantidade
    FROM months m
    CROSS JOIN public.clientes c
    LEFT JOIN public.pagamentos p ON 
      c.id = p.cliente_id AND 
      EXTRACT(MONTH FROM m.month_date) = p.mes AND
      EXTRACT(YEAR FROM m.month_date) = p.ano AND
      p.status IN ('pago', 'pago_confianca')
    WHERE 
      c.user_id = user_id_param AND
      (
        -- Include clients with payments for this month
        p.id IS NOT NULL OR
        -- Or include clients that were created before this month and would be considered active
        -- at that time (for backward compatibility)
        (c.created_at <= (m.month_date + interval '1 month' - interval '1 day') AND 
         c.status = 'ativo')
      )
    GROUP BY m.month_date
    ORDER BY m.month_date
  )
  SELECT json_agg(json_build_object('mes', mes, 'quantidade', quantidade)) 
  INTO evolucao_clientes 
  FROM monthly_active_clients;
  
  -- Get device distribution
  SELECT json_agg(json_build_object('dispositivo', dispositivo, 'quantidade', count))
  INTO distribuicao_dispositivos
  FROM (
    SELECT dispositivo_smart AS dispositivo, COUNT(*) AS count
    FROM public.clientes
    WHERE user_id = user_id_param AND dispositivo_smart IS NOT NULL
    GROUP BY dispositivo_smart
    UNION ALL
    SELECT dispositivo_smart_2 AS dispositivo, COUNT(*) AS count
    FROM public.clientes
    WHERE user_id = user_id_param AND dispositivo_smart_2 IS NOT NULL
    GROUP BY dispositivo_smart_2
  ) AS device_counts;
  
  -- Get app distribution
  SELECT json_agg(json_build_object('aplicativo', aplicativo, 'quantidade', count))
  INTO distribuicao_aplicativos
  FROM (
    SELECT aplicativo, COUNT(*) AS count
    FROM public.clientes
    WHERE user_id = user_id_param
    GROUP BY aplicativo
    UNION ALL
    SELECT aplicativo_2 AS aplicativo, COUNT(*) AS count
    FROM public.clientes
    WHERE user_id = user_id_param AND aplicativo_2 IS NOT NULL
    GROUP BY aplicativo_2
  ) AS app_counts;
  
  -- Get UF distribution
  SELECT json_agg(json_build_object('uf', uf, 'quantidade', count))
  INTO distribuicao_ufs
  FROM (
    SELECT uf, COUNT(*) AS count
    FROM public.clientes
    WHERE user_id = user_id_param AND uf IS NOT NULL
    GROUP BY uf
  ) AS uf_counts;
  
  -- Get server distribution
  SELECT json_agg(json_build_object('servidor', servidor, 'quantidade', count))
  INTO distribuicao_servidores
  FROM (
    SELECT servidor, COUNT(*) AS count
    FROM public.clientes
    WHERE user_id = user_id_param
    GROUP BY servidor
  ) AS server_counts;
  
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
  
  -- Calculate payments by month for last 12 months
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE) - interval '11 month',
      date_trunc('month', CURRENT_DATE),
      interval '1 month'
    ) AS month_date
  ),
  monthly_payments AS (
    SELECT 
      to_char(month_date, 'Mon/YY') AS mes,
      COALESCE(SUM(c.valor_plano), 0) AS valor
    FROM months
    LEFT JOIN public.pagamentos p ON 
      p.mes = EXTRACT(MONTH FROM month_date) AND 
      p.ano = EXTRACT(YEAR FROM month_date) AND
      p.status IN ('pago', 'pago_confianca')
    LEFT JOIN public.clientes c ON 
      c.id = p.cliente_id AND
      c.user_id = user_id_param
    GROUP BY month_date
    ORDER BY month_date
  )
  SELECT json_agg(json_build_object('mes', mes, 'valor', valor)) 
  INTO pagamentos_por_mes 
  FROM monthly_payments;
  
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
  -- Collect both main screen and secondary screen app expirations
  WITH apps_vencendo AS (
    -- Main screen apps expiring in next 30 days
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
    
    -- Secondary screen apps expiring in next 30 days
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
  
  -- Get detailed client risk information (moved from frontend)
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
      p_atual.id IS NULL AND -- Não pagou o mês atual
      EXTRACT(DAY FROM CURRENT_DATE) <= c.dia_vencimento AND -- Ainda está no prazo
      (c.dia_vencimento - EXTRACT(DAY FROM CURRENT_DATE)) <= 3 -- Vence nos próximos 3 dias
  )
  SELECT json_agg(json_build_object(
    'id', id,
    'nome', nome,
    'servidor', servidor,
    'dias_restantes', dias_restantes
  ) ORDER BY dias_restantes ASC)
  INTO clientes_em_risco_detalhes
  FROM clientes_em_risco;
  
  -- Build the complete stats object
  stats := json_build_object(
    'clientes_ativos', clientes_ativos,
    'clientes_inativos', clientes_inativos,
    'clientes_novos', clientes_novos,
    'clientes_total', clientes_ativos + clientes_inativos,
    'pagamentos_pendentes', pagamentos_pendentes,
    'valor_recebido_mes', valor_recebido_mes,
    'evolucao_clientes', evolucao_clientes,
    'distribuicao_dispositivos', distribuicao_dispositivos,
    'distribuicao_aplicativos', distribuicao_aplicativos,
    'distribuicao_ufs', distribuicao_ufs,
    'distribuicao_servidores', distribuicao_servidores,
    'pagamentos_por_mes', pagamentos_por_mes,
    'clientes_inativos_proximos_dias', clientes_inativos_proximos_dias,
    'apps_vencendo_proximos_dias', apps_vencendo_proximos_dias,
    'clientes_em_risco_detalhes', clientes_em_risco_detalhes
  );
  
  RETURN stats;
END;
$function$