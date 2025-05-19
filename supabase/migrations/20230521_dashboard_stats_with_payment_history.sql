
-- Esta função será implementada no dashboard para mostrar os clientes ativos
-- com base no histórico de pagamentos, mesmo para meses anteriores ao cadastro
CREATE OR REPLACE FUNCTION public.get_dashboard_stats_with_payments_history(user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  
  -- Get client evolution over last 12 months - MODIFIED to consider payment status
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', CURRENT_DATE) - interval '11 month',
      date_trunc('month', CURRENT_DATE),
      interval '1 month'
    ) AS month_date
  ),
  active_clients_by_month AS (
    SELECT 
      to_char(month_date, 'Mon/YY') AS mes,
      COUNT(DISTINCT c.id) AS quantidade
    FROM months
    -- For each month, include clients who have payments in that month or the previous month
    LEFT JOIN public.pagamentos p ON 
      (p.mes = EXTRACT(MONTH FROM month_date) AND 
       p.ano = EXTRACT(YEAR FROM month_date)) OR
      (p.mes = EXTRACT(MONTH FROM (month_date - INTERVAL '1 month')) AND 
       p.ano = EXTRACT(YEAR FROM (month_date - INTERVAL '1 month')))
    LEFT JOIN public.clientes c ON 
      c.id = p.cliente_id AND
      c.user_id = user_id_param AND
      p.status IN ('pago', 'pago_confianca')
    GROUP BY month_date
    ORDER BY month_date
  )
  SELECT json_agg(json_build_object('mes', mes, 'quantidade', quantidade)) 
  INTO evolucao_clientes 
  FROM active_clients_by_month;
  
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
    'pagamentos_por_mes', pagamentos_por_mes
  );
  
  RETURN stats;
END;
$$;
