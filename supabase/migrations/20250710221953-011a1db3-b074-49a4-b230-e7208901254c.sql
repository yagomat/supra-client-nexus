-- Remover função duplicada que está causando conflito no rate limiting de exportação
-- Manter apenas a versão mais flexível com parâmetros opcionais

-- Primeiro, remover todas as versões da função check_export_rate_limit
DROP FUNCTION IF EXISTS public.check_export_rate_limit(uuid);
DROP FUNCTION IF EXISTS public.check_export_rate_limit(uuid, integer, integer);

-- Recriar apenas a versão correta com parâmetros padrão
CREATE OR REPLACE FUNCTION public.check_export_rate_limit(
  p_user_id uuid, 
  p_max_requests integer DEFAULT 50, 
  p_time_window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN check_rate_limit(p_user_id, 'export_excel', p_max_requests, p_time_window_minutes);
END;
$function$;