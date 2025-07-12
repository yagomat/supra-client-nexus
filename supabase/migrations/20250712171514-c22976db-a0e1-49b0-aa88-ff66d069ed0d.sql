
-- Remover todas as versões duplicadas da função log_audit_event
DROP FUNCTION IF EXISTS public.log_audit_event(uuid, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.log_audit_event(uuid, unknown, jsonb) CASCADE;

-- Criar apenas uma versão limpa e consolidada da função
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_details JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details,
    created_at
  ) VALUES (
    p_user_id,
    p_event_type,
    p_details,
    NOW()
  );
END;
$$;

-- Limpar logs antigos de dashboard para melhorar performance
DELETE FROM public.audit_logs 
WHERE event_type LIKE 'dashboard_%' 
AND created_at < NOW() - INTERVAL '24 hours';
