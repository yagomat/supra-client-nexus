-- Atualizar função check_export_rate_limit para ser mais flexível
CREATE OR REPLACE FUNCTION public.check_export_rate_limit(p_user_id uuid, p_max_requests integer DEFAULT 50, p_time_window_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN check_rate_limit(p_user_id, 'export_excel', p_max_requests, p_time_window_minutes);
END;
$function$;