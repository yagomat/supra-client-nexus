
-- Remover todas as versões conflitantes da função log_audit_event
DROP FUNCTION IF EXISTS public.log_audit_event(uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.log_audit_event(uuid, unknown, jsonb);

-- Recriar a função log_audit_event com definição única e clara
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id uuid,
    p_event_type text,
    p_details jsonb DEFAULT NULL
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
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    COALESCE(p_details, '{}'::jsonb),
    NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log de fallback em caso de erro
    RAISE LOG 'Erro ao inserir log de auditoria: % - User: % - Event: %', 
      SQLERRM, p_user_id, p_event_type;
END;
$function$;
