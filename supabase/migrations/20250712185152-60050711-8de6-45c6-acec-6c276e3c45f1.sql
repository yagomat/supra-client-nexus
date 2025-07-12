
-- Corrigir a ambiguidade na função log_audit_event
-- Primeiro, vamos dropar as versões duplicadas e criar uma versão única e correta

DROP FUNCTION IF EXISTS public.log_audit_event(uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.log_audit_event(uuid, unknown, jsonb);

-- Criar a versão correta da função log_audit_event
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
AS $function$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_event_type,
    p_details,
    p_ip_address,
    p_user_agent
  );
END;
$function$;
