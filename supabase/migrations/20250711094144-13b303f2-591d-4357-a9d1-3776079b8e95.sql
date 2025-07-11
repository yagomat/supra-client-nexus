
-- Habilitar extensão pgcrypto para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Habilitar extensão pg_cron para jobs automáticos
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Função para mascarar endereços IP
CREATE OR REPLACE FUNCTION public.mask_ip_address(p_ip TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Se o IP for nulo ou vazio, retornar como está
  IF p_ip IS NULL OR LENGTH(TRIM(p_ip)) = 0 THEN
    RETURN p_ip;
  END IF;
  
  -- Mascarar IPv4 (ex: 192.168.1.123 -> 192.168.1.xxx)
  IF p_ip ~ '^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$' THEN
    RETURN regexp_replace(p_ip, '\.([0-9]{1,3})$', '.xxx');
  END IF;
  
  -- Mascarar IPv6 (manter primeiros 64 bits, mascarar últimos 64 bits)
  IF p_ip ~ '^[0-9a-fA-F:]+$' AND p_ip LIKE '%:%' THEN
    -- Simplificação: mascarar após o 4º grupo de números hexadecimais
    RETURN regexp_replace(p_ip, '(:[0-9a-fA-F]{1,4}){4,}$', ':xxxx:xxxx:xxxx:xxxx');
  END IF;
  
  -- Se não conseguir identificar o formato, retornar mascarado
  RETURN 'xxx.xxx.xxx.xxx';
END;
$$;

-- Função para simplificar User-Agent
CREATE OR REPLACE FUNCTION public.simplify_user_agent(p_user_agent TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Se o user agent for nulo ou vazio, retornar como está
  IF p_user_agent IS NULL OR LENGTH(TRIM(p_user_agent)) = 0 THEN
    RETURN p_user_agent;
  END IF;
  
  -- Detectar dispositivos móveis
  IF p_user_agent ~* '(mobile|android|iphone|ipad|blackberry|windows phone|webos)' THEN
    RETURN 'Mobile';
  END IF;
  
  -- Detectar tablets (que não foram pegos como mobile)
  IF p_user_agent ~* '(tablet|ipad)' THEN
    RETURN 'Tablet';
  END IF;
  
  -- Caso contrário, considerar desktop
  RETURN 'Desktop';
END;
$$;

-- Função para criptografar dados sensíveis
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(p_data TEXT, p_key TEXT DEFAULT 'audit_log_encryption_key')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se o dado for nulo ou vazio, retornar como está
  IF p_data IS NULL OR LENGTH(TRIM(p_data)) = 0 THEN
    RETURN p_data;
  END IF;
  
  -- Criptografar usando AES
  RETURN encode(encrypt(p_data::bytea, p_key::bytea, 'aes'), 'base64');
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro na criptografia, retornar o dado original
    RETURN p_data;
END;
$$;

-- Função para descriptografar dados sensíveis
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(p_encrypted_data TEXT, p_key TEXT DEFAULT 'audit_log_encryption_key')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se o dado for nulo ou vazio, retornar como está
  IF p_encrypted_data IS NULL OR LENGTH(TRIM(p_encrypted_data)) = 0 THEN
    RETURN p_encrypted_data;
  END IF;
  
  -- Tentar descriptografar
  RETURN convert_from(decrypt(decode(p_encrypted_data, 'base64'), p_key::bytea, 'aes'), 'UTF8');
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro na descriptografia, retornar o dado como está
    RETURN p_encrypted_data;
END;
$$;

-- Atualizar função log_audit_event para aplicar segurança
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_details JSONB,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_masked_ip TEXT;
  v_simplified_user_agent TEXT;
  v_encrypted_ip TEXT;
  v_encrypted_user_agent TEXT;
BEGIN
  -- Aplicar mascaramento e criptografia no IP
  IF p_ip_address IS NOT NULL THEN
    v_masked_ip := public.mask_ip_address(p_ip_address);
    v_encrypted_ip := public.encrypt_sensitive_data(v_masked_ip);
  END IF;
  
  -- Aplicar simplificação e criptografia no User-Agent
  IF p_user_agent IS NOT NULL THEN
    v_simplified_user_agent := public.simplify_user_agent(p_user_agent);
    v_encrypted_user_agent := public.encrypt_sensitive_data(v_simplified_user_agent);
  END IF;
  
  -- Inserir log com dados processados
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
    v_encrypted_ip,
    v_encrypted_user_agent
  );
END;
$$;

-- Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(p_retention_days INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Deletar logs mais antigos que o período de retenção
  DELETE FROM public.audit_logs
  WHERE created_at < (NOW() - INTERVAL '1 day' * p_retention_days);
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Log da operação de limpeza
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details,
    ip_address,
    user_agent
  ) VALUES (
    NULL,
    'system_log_cleanup',
    jsonb_build_object(
      'deleted_count', v_deleted_count,
      'retention_days', p_retention_days,
      'cleanup_timestamp', NOW()
    ),
    NULL,
    NULL
  );
  
  RETURN v_deleted_count;
END;
$$;

-- Função para obter logs descriptografados (apenas para o próprio usuário)
CREATE OR REPLACE FUNCTION public.get_user_audit_logs_decrypted()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  event_type TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    al.event_type,
    al.details,
    al.created_at,
    CASE 
      WHEN al.ip_address IS NOT NULL 
      THEN public.decrypt_sensitive_data(al.ip_address)
      ELSE NULL 
    END as ip_address,
    CASE 
      WHEN al.user_agent IS NOT NULL 
      THEN public.decrypt_sensitive_data(al.user_agent)
      ELSE NULL 
    END as user_agent
  FROM public.audit_logs al
  WHERE al.user_id = auth.uid()
  ORDER BY al.created_at DESC;
END;
$$;

-- Agendar limpeza automática diária às 02:00
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 2 * * *', -- Diariamente às 02:00
  $$SELECT public.cleanup_old_audit_logs(90);$$
);
