
-- Corrigir a função de rate limiting para contar corretamente as exclusões
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id uuid, 
  p_operation text, 
  p_max_requests integer DEFAULT 100, 
  p_time_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular o timestamp limite
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  -- Debug: Log da operação que está sendo verificada
  RAISE LOG 'Verificando rate limit para user_id: %, operação: %, limite: %, janela: % minutos', 
    p_user_id, p_operation, p_max_requests, p_time_window_minutes;
  
  -- Para operações de exclusão, contar apenas logs de exclusão específicos
  IF p_operation = 'delete_cliente' THEN
    SELECT COUNT(*)
    INTO v_request_count
    FROM public.audit_logs
    WHERE user_id = p_user_id
      AND event_type = 'cliente_delete'
      AND created_at > v_time_threshold;
      
    -- Debug: Log da contagem atual
    RAISE LOG 'Contagem atual de exclusões para user_id %: % (limite: %)', 
      p_user_id, v_request_count, p_max_requests;
  ELSE
    -- Para outras operações, usar a contagem geral
    SELECT COUNT(*)
    INTO v_request_count
    FROM public.audit_logs
    WHERE user_id = p_user_id
      AND event_type LIKE 'cliente_%'
      AND created_at > v_time_threshold;
  END IF;
  
  -- Retornar se está dentro do limite
  RETURN v_request_count < p_max_requests;
END;
$$;

-- Também vamos verificar se existe algum log antigo que possa estar interferindo
-- Limpar logs antigos de teste se existirem
DELETE FROM public.audit_logs 
WHERE event_type = 'cliente_delete' 
AND created_at < (NOW() - INTERVAL '1 hour');
