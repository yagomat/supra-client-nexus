-- Fase 1: Segurança Crítica - Mover cálculos de status para backend e rate limiting rigoroso

-- 1. Função para calcular status de pagamento de cliente (migração da lógica do frontend)
CREATE OR REPLACE FUNCTION public.calculate_cliente_payment_status(
  p_cliente_id UUID,
  p_user_id UUID DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente RECORD;
  v_payments RECORD[];
  v_today DATE;
  v_current_day INTEGER;
  v_current_month INTEGER;
  v_current_year INTEGER;
  v_valid_payments RECORD[];
  v_current_month_payment RECORD;
  v_consecutive_sequence RECORD[];
  v_last_payment RECORD;
  v_next_due_date DATE;
  v_days_diff INTEGER;
  v_result JSON;
BEGIN
  -- Verificar autorização
  IF p_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clientes 
    WHERE id = p_cliente_id AND user_id = p_user_id
  ) THEN
    RETURN json_build_object(
      'error', 'Cliente não encontrado ou não autorizado'
    );
  END IF;

  -- Obter dados do cliente
  SELECT * INTO v_cliente 
  FROM public.clientes 
  WHERE id = p_cliente_id;
  
  IF v_cliente IS NULL THEN
    RETURN json_build_object(
      'error', 'Cliente não encontrado'
    );
  END IF;

  -- Configurar data atual
  v_today := CURRENT_DATE;
  v_current_day := EXTRACT(DAY FROM v_today);
  v_current_month := EXTRACT(MONTH FROM v_today);
  v_current_year := EXTRACT(YEAR FROM v_today);

  -- Buscar todos os pagamentos válidos do cliente
  SELECT array_agg(ROW(p.id, p.mes, p.ano, p.status, p.data_pagamento) ORDER BY p.ano, p.mes)
  INTO v_valid_payments
  FROM public.pagamentos p
  WHERE p.cliente_id = p_cliente_id 
    AND p.status IN ('pago', 'pago_confianca');

  -- Se não há pagamentos válidos, não mostrar informação de vencimento
  IF array_length(v_valid_payments, 1) IS NULL THEN
    RETURN json_build_object(
      'type', 'no_info',
      'days', 0
    );
  END IF;

  -- Verificar se tem pagamento no mês atual
  SELECT p.* INTO v_current_month_payment
  FROM public.pagamentos p
  WHERE p.cliente_id = p_cliente_id 
    AND p.mes = v_current_month 
    AND p.ano = v_current_year
    AND p.status IN ('pago', 'pago_confianca')
  LIMIT 1;

  -- Para clientes ATIVOS (com pagamento no mês atual)
  IF v_current_month_payment IS NOT NULL AND v_cliente.status = 'ativo' THEN
    -- Encontrar último pagamento da sequência consecutiva atual
    SELECT p.* INTO v_last_payment
    FROM public.pagamentos p
    WHERE p.cliente_id = p_cliente_id 
      AND p.status IN ('pago', 'pago_confianca')
      AND (p.ano > v_current_year OR (p.ano = v_current_year AND p.mes >= v_current_month))
    ORDER BY p.ano DESC, p.mes DESC
    LIMIT 1;
    
    -- Calcular próxima data de vencimento
    v_next_due_date := DATE(v_last_payment.ano, v_last_payment.mes, 1) + INTERVAL '1 month';
    v_next_due_date := DATE(EXTRACT(YEAR FROM v_next_due_date), EXTRACT(MONTH FROM v_next_due_date), 
                           LEAST(v_cliente.dia_vencimento, EXTRACT(DAY FROM (v_next_due_date + INTERVAL '1 month' - INTERVAL '1 day'))));
    
    v_days_diff := v_next_due_date - v_today;

    IF v_days_diff > 0 THEN
      v_result := json_build_object(
        'type', 'upcoming',
        'days', v_days_diff,
        'nextDueDate', v_next_due_date
      );
    ELSIF v_days_diff = 0 THEN
      v_result := json_build_object(
        'type', 'today',
        'days', 0,
        'nextDueDate', v_next_due_date
      );
    ELSE
      v_result := json_build_object(
        'type', 'overdue',
        'days', ABS(v_days_diff),
        'nextDueDate', v_next_due_date
      );
    END IF;
  ELSE
    -- Para clientes INATIVOS
    SELECT p.* INTO v_last_payment
    FROM public.pagamentos p
    WHERE p.cliente_id = p_cliente_id 
      AND p.status IN ('pago', 'pago_confianca')
      AND (p.ano < v_current_year OR (p.ano = v_current_year AND p.mes <= v_current_month))
    ORDER BY p.ano DESC, p.mes DESC
    LIMIT 1;
    
    IF v_last_payment IS NULL THEN
      RETURN json_build_object(
        'type', 'no_info',
        'days', 0
      );
    END IF;

    -- Calcular próxima data de vencimento baseada no último pagamento
    v_next_due_date := DATE(v_last_payment.ano, v_last_payment.mes, 1) + INTERVAL '1 month';
    v_next_due_date := DATE(EXTRACT(YEAR FROM v_next_due_date), EXTRACT(MONTH FROM v_next_due_date), 
                           LEAST(v_cliente.dia_vencimento, EXTRACT(DAY FROM (v_next_due_date + INTERVAL '1 month' - INTERVAL '1 day'))));
    
    v_days_diff := v_today - v_next_due_date;

    IF v_days_diff > 0 THEN
      v_result := json_build_object(
        'type', 'overdue',
        'days', v_days_diff,
        'lastPaymentDate', DATE(v_last_payment.ano, v_last_payment.mes - 1, 1),
        'nextDueDate', v_next_due_date
      );
    ELSIF v_days_diff = 0 THEN
      v_result := json_build_object(
        'type', 'today',
        'days', 0,
        'nextDueDate', v_next_due_date
      );
    ELSE
      v_result := json_build_object(
        'type', 'upcoming',
        'days', ABS(v_days_diff),
        'nextDueDate', v_next_due_date
      );
    END IF;
  END IF;

  RETURN v_result;
END;
$$;

-- 2. Função para calcular prioridade de ordenação (migração da lógica do frontend)
CREATE OR REPLACE FUNCTION public.calculate_cliente_sorting_priority(
  p_cliente_id UUID,
  p_user_id UUID DEFAULT NULL
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente RECORD;
  v_payment_status JSON;
  v_priority INTEGER;
BEGIN
  -- Verificar autorização
  IF p_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.clientes 
    WHERE id = p_cliente_id AND user_id = p_user_id
  ) THEN
    RETURN 10000; -- Máxima prioridade (vai para o final)
  END IF;

  -- Obter dados do cliente
  SELECT * INTO v_cliente FROM public.clientes WHERE id = p_cliente_id;
  
  IF v_cliente IS NULL THEN
    RETURN 10000;
  END IF;

  -- Obter status de pagamento
  SELECT public.calculate_cliente_payment_status(p_cliente_id, p_user_id) INTO v_payment_status;
  
  -- Se não há informação de vencimento, vai para o final
  IF v_payment_status->>'type' = 'no_info' THEN
    RETURN 10000;
  END IF;
  
  IF v_cliente.status = 'inativo' THEN
    -- Clientes inativos têm prioridade maior (valores negativos)
    IF v_payment_status->>'type' = 'overdue' THEN
      RETURN -(v_payment_status->>'days')::INTEGER; -- Mais negativo = maior prioridade
    ELSE
      RETURN -1000; -- Prioridade alta para inativos
    END IF;
  ELSE
    -- Clientes ativos vêm depois (valores positivos)
    IF v_payment_status->>'type' = 'upcoming' THEN
      RETURN (v_payment_status->>'days')::INTEGER + 1000; -- Soma 1000 para vir depois dos inativos
    ELSIF v_payment_status->>'type' = 'today' THEN
      RETURN 1000; -- Vence hoje mas é ativo
    ELSE
      RETURN 1500; -- Outros casos de ativos
    END IF;
  END IF;
END;
$$;

-- 3. RPC para obter clientes com status calculado no backend
CREATE OR REPLACE FUNCTION public.get_clientes_with_calculated_status(
  p_user_id UUID DEFAULT NULL,
  p_status TEXT DEFAULT NULL
) RETURNS TABLE(
  cliente_data JSON,
  payment_status JSON,
  sorting_priority INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_json(c.*) as cliente_data,
    public.calculate_cliente_payment_status(c.id, COALESCE(p_user_id, auth.uid())) as payment_status,
    public.calculate_cliente_sorting_priority(c.id, COALESCE(p_user_id, auth.uid())) as sorting_priority
  FROM public.clientes c
  WHERE 
    (p_user_id IS NULL OR c.user_id = p_user_id)
    AND (auth.uid() = c.user_id) -- RLS adicional
    AND (p_status IS NULL OR p_status = 'todos' OR c.status = p_status)
  ORDER BY public.calculate_cliente_sorting_priority(c.id, COALESCE(p_user_id, auth.uid()));
END;
$$;

-- 4. Rate limiting rigoroso para todas as operações
CREATE OR REPLACE FUNCTION public.check_comprehensive_rate_limit(
  p_user_id UUID,
  p_operation TEXT,
  p_max_requests INTEGER DEFAULT NULL,
  p_time_window_minutes INTEGER DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
  v_max_requests INTEGER;
  v_time_window INTEGER;
  v_current_requests INTEGER;
BEGIN
  -- Definir limites específicos por operação
  CASE p_operation
    WHEN 'list_clientes' THEN
      v_max_requests := COALESCE(p_max_requests, 60);
      v_time_window := COALESCE(p_time_window_minutes, 60);
    WHEN 'search_clientes' THEN
      v_max_requests := COALESCE(p_max_requests, 30);
      v_time_window := COALESCE(p_time_window_minutes, 60);
    WHEN 'create_cliente' THEN
      v_max_requests := COALESCE(p_max_requests, 10);
      v_time_window := COALESCE(p_time_window_minutes, 60);
    WHEN 'update_cliente' THEN
      v_max_requests := COALESCE(p_max_requests, 30);
      v_time_window := COALESCE(p_time_window_minutes, 60);
    WHEN 'delete_cliente' THEN
      v_max_requests := COALESCE(p_max_requests, 5);
      v_time_window := COALESCE(p_time_window_minutes, 60);
    WHEN 'export_excel' THEN
      v_max_requests := COALESCE(p_max_requests, 3);
      v_time_window := COALESCE(p_time_window_minutes, 60);
    WHEN 'dashboard_stats' THEN
      v_max_requests := COALESCE(p_max_requests, 10);
      v_time_window := COALESCE(p_time_window_minutes, 1);
    WHEN 'payment_update' THEN
      v_max_requests := COALESCE(p_max_requests, 50);
      v_time_window := COALESCE(p_time_window_minutes, 60);
    ELSE
      -- Operação genérica
      v_max_requests := COALESCE(p_max_requests, 100);
      v_time_window := COALESCE(p_time_window_minutes, 60);
  END CASE;

  -- Calcular o timestamp limite
  v_time_threshold := NOW() - INTERVAL '1 minute' * v_time_window;
  
  -- Contar requests no período
  SELECT COUNT(*)
  INTO v_current_requests
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND event_type = ('operation_' || p_operation)
    AND created_at > v_time_threshold;
  
  -- Log da operação atual
  PERFORM public.log_audit_event(
    p_user_id,
    'operation_' || p_operation,
    json_build_object(
      'timestamp', NOW(),
      'operation', p_operation,
      'current_count', v_current_requests + 1,
      'limit', v_max_requests
    )::jsonb
  );
  
  -- Retornar resultado completo
  RETURN json_build_object(
    'allowed', (v_current_requests < v_max_requests),
    'current_requests', v_current_requests + 1,
    'max_requests', v_max_requests,
    'time_window_minutes', v_time_window,
    'reset_time', v_time_threshold + INTERVAL '1 minute' * v_time_window,
    'operation', p_operation
  );
END;
$$;

-- 5. Função helper para verificar rate limit simples (compatibilidade)
CREATE OR REPLACE FUNCTION public.check_operation_rate_limit(
  p_user_id UUID,
  p_operation TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT public.check_comprehensive_rate_limit(p_user_id, p_operation) INTO v_result;
  RETURN (v_result->>'allowed')::BOOLEAN;
END;
$$;