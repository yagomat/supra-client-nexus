
-- Remover funções de rate limit redundantes e consolidar em uma única função principal

-- Primeiro, remover as funções redundantes
DROP FUNCTION IF EXISTS public.check_comprehensive_rate_limit(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.check_consolidated_rate_limit(uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.check_operation_rate_limit(uuid, text);
DROP FUNCTION IF EXISTS public.check_dashboard_rate_limit(uuid, integer, integer);
DROP FUNCTION IF EXISTS public.check_profile_rate_limit(uuid, integer, integer);
DROP FUNCTION IF EXISTS public.check_templates_rate_limit(uuid, integer, integer);
DROP FUNCTION IF EXISTS public.check_valores_predefinidos_rate_limit(uuid, text, integer, integer);

-- Manter apenas check_rate_limit como função principal e check_export_rate_limit como especializada
-- Atualizar check_rate_limit para ser mais robusta e flexível
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
  
  -- Log apenas em desenvolvimento (evitar spam de logs)
  IF current_setting('app.environment', true) = 'development' THEN
    RAISE LOG 'Rate limit check: user_id=%, operation=%, limit=%, window=%min', 
      p_user_id, p_operation, p_max_requests, p_time_window_minutes;
  END IF;
  
  -- Contar requests baseado no tipo de operação
  CASE p_operation
    WHEN 'delete_cliente' THEN
      SELECT COUNT(*)
      INTO v_request_count
      FROM public.audit_logs
      WHERE user_id = p_user_id
        AND event_type = 'cliente_delete'
        AND created_at > v_time_threshold;
    
    WHEN 'export_excel' THEN
      SELECT COUNT(*)
      INTO v_request_count
      FROM public.audit_logs
      WHERE user_id = p_user_id
        AND event_type = 'export_excel'
        AND created_at > v_time_threshold;
    
    WHEN 'dashboard_request' THEN
      SELECT COUNT(*)
      INTO v_request_count
      FROM public.audit_logs
      WHERE user_id = p_user_id
        AND event_type LIKE 'dashboard_%'
        AND created_at > v_time_threshold;
    
    ELSE
      -- Para outras operações, usar padrão geral
      SELECT COUNT(*)
      INTO v_request_count
      FROM public.audit_logs
      WHERE user_id = p_user_id
        AND (
          event_type LIKE (p_operation || '%') OR
          event_type LIKE ('cliente_' || p_operation) OR
          event_type = p_operation
        )
        AND created_at > v_time_threshold;
  END CASE;
  
  -- Log apenas se exceder o limite (para debugging)
  IF v_request_count >= p_max_requests AND current_setting('app.environment', true) = 'development' THEN
    RAISE LOG 'Rate limit exceeded: user_id=%, operation=%, count=%/%', 
      p_user_id, p_operation, v_request_count, p_max_requests;
  END IF;
  
  -- Retornar se está dentro do limite
  RETURN v_request_count < p_max_requests;
END;
$$;

-- Simplificar check_export_rate_limit para usar a função principal
CREATE OR REPLACE FUNCTION public.check_export_rate_limit(
  p_user_id uuid, 
  p_max_requests integer DEFAULT 50, 
  p_time_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Usar a função principal com operação especializada
  RETURN public.check_rate_limit(p_user_id, 'export_excel', p_max_requests, p_time_window_minutes);
END;
$$;

-- Criar função auxiliar para log de auditoria padronizado
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_event_type text,
  p_details jsonb DEFAULT NULL,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details,
    ip_address,
    user_agent,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    COALESCE(p_details, jsonb_build_object('timestamp', NOW())),
    p_ip_address,
    p_user_agent,
    NOW()
  );
END;
$$;

-- Remover função de validação não utilizada
DROP FUNCTION IF EXISTS public.get_validation_config();

-- Limpar logs antigos de auditoria (manter apenas últimos 90 dias por padrão)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(p_retention_days integer DEFAULT 90)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.audit_logs 
  WHERE created_at < (NOW() - INTERVAL '1 day' * p_retention_days);
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Log da limpeza
  IF v_deleted_count > 0 THEN
    INSERT INTO public.audit_logs (user_id, event_type, details)
    VALUES (
      NULL,
      'system_cleanup',
      jsonb_build_object(
        'deleted_logs_count', v_deleted_count,
        'retention_days', p_retention_days,
        'cleanup_timestamp', NOW()
      )
    );
  END IF;
  
  RETURN v_deleted_count;
END;
$$;
