
-- Criar função para obter chave de criptografia de forma segura
CREATE OR REPLACE FUNCTION public.get_encryption_key(p_key_name TEXT DEFAULT 'default')
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key TEXT;
  v_fallback_key TEXT;
BEGIN
  -- Tentar obter chave do Supabase Vault (quando disponível)
  -- Por enquanto, usar uma abordagem mais segura com base no ambiente
  
  -- Gerar chave baseada em configurações do sistema + salt único
  SELECT encode(digest(
    COALESCE(
      current_setting('app.encryption_master_key', true),
      concat(
        current_setting('app.jwt_secret', true),
        '_encryption_salt_',
        p_key_name,
        '_2024'
      )
    ), 'sha256'), 'hex') INTO v_key;
  
  -- Se não conseguir obter, usar fallback mais seguro
  IF v_key IS NULL OR length(v_key) < 32 THEN
    SELECT encode(digest(concat(
      'secure_fallback_key_',
      p_key_name,
      '_',
      extract(epoch from now())::text
    ), 'sha256'), 'hex') INTO v_fallback_key;
    
    v_key := v_fallback_key;
  END IF;
  
  RETURN v_key;
END;
$$;

-- Atualizar função de criptografia para usar chave segura
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(p_data text, p_key text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key text;
  v_encrypted text;
BEGIN
  -- Usar chave fornecida ou obter chave segura
  IF p_key IS NOT NULL THEN
    v_key := p_key;
  ELSE
    v_key := public.get_encryption_key('sensitive_data');
  END IF;
  
  -- Criptografar usando pgcrypto
  SELECT encode(encrypt(p_data::bytea, v_key::bytea, 'aes'), 'hex') INTO v_encrypted;
  
  RETURN v_encrypted;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para auditoria
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      details
    ) VALUES (
      auth.uid(),
      'encryption_error',
      jsonb_build_object(
        'error', SQLERRM,
        'timestamp', NOW(),
        'data_length', length(p_data)
      )
    );
    
    -- Não retornar dados originais por segurança
    RAISE EXCEPTION 'Erro na criptografia de dados sensíveis';
END;
$$;

-- Atualizar função de descriptografia para usar chave segura
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(p_encrypted_data text, p_key text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key text;
  v_decrypted text;
BEGIN
  -- Verificar se dados parecem estar criptografados
  IF p_encrypted_data IS NULL OR length(p_encrypted_data) < 32 THEN
    RETURN p_encrypted_data;
  END IF;
  
  -- Usar chave fornecida ou obter chave segura
  IF p_key IS NOT NULL THEN
    v_key := p_key;
  ELSE
    v_key := public.get_encryption_key('sensitive_data');
  END IF;
  
  -- Descriptografar
  SELECT convert_from(decrypt(decode(p_encrypted_data, 'hex'), v_key::bytea, 'aes'), 'UTF8') INTO v_decrypted;
  
  RETURN v_decrypted;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro para auditoria
    INSERT INTO public.audit_logs (
      user_id,
      event_type,
      details
    ) VALUES (
      auth.uid(),
      'decryption_error',
      jsonb_build_object(
        'error', SQLERRM,
        'timestamp', NOW(),
        'data_length', length(p_encrypted_data)
      )
    );
    
    -- Retornar indicador de erro em vez do dado original
    RETURN '[ERRO_DESCRIPTOGRAFIA]';
END;
$$;

-- Criar função para validar integridade da criptografia
CREATE OR REPLACE FUNCTION public.validate_encryption_integrity(p_data TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o dado parece ser um hash criptográfico válido
  RETURN (
    p_data IS NOT NULL AND
    length(p_data) >= 32 AND
    length(p_data) <= 1024 AND
    p_data ~ '^[a-f0-9]+$'
  );
END;
$$;

-- Atualizar trigger de criptografia com validação melhorada
CREATE OR REPLACE FUNCTION public.encrypt_cliente_sensitive_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criptografar telefone se fornecido e não estiver criptografado
  IF NEW.telefone IS NOT NULL AND NEW.telefone != '' THEN
    IF NOT public.validate_encryption_integrity(NEW.telefone) THEN
      NEW.telefone := public.encrypt_sensitive_data(NEW.telefone);
    END IF;
  END IF;
  
  -- Criptografar usuario_aplicativo
  IF NEW.usuario_aplicativo IS NOT NULL AND NEW.usuario_aplicativo != '' THEN
    IF NOT public.validate_encryption_integrity(NEW.usuario_aplicativo) THEN
      NEW.usuario_aplicativo := public.encrypt_sensitive_data(NEW.usuario_aplicativo);
    END IF;
  END IF;
  
  -- Criptografar senha_aplicativo
  IF NEW.senha_aplicativo IS NOT NULL AND NEW.senha_aplicativo != '' THEN
    IF NOT public.validate_encryption_integrity(NEW.senha_aplicativo) THEN
      NEW.senha_aplicativo := public.encrypt_sensitive_data(NEW.senha_aplicativo);
    END IF;
  END IF;
  
  -- Criptografar usuario_2
  IF NEW.usuario_2 IS NOT NULL AND NEW.usuario_2 != '' THEN
    IF NOT public.validate_encryption_integrity(NEW.usuario_2) THEN
      NEW.usuario_2 := public.encrypt_sensitive_data(NEW.usuario_2);
    END IF;
  END IF;
  
  -- Criptografar senha_2
  IF NEW.senha_2 IS NOT NULL AND NEW.senha_2 != '' THEN
    IF NOT public.validate_encryption_integrity(NEW.senha_2) THEN
      NEW.senha_2 := public.encrypt_sensitive_data(NEW.senha_2);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Função para rotação de chaves (para uso futuro)
CREATE OR REPLACE FUNCTION public.rotate_encryption_keys()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Verificar se usuário é admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem rotacionar chaves de criptografia';
  END IF;
  
  -- Log da operação
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details
  ) VALUES (
    auth.uid(),
    'encryption_key_rotation_requested',
    jsonb_build_object(
      'timestamp', NOW(),
      'admin_user', auth.uid()
    )
  );
  
  v_result := json_build_object(
    'success', true,
    'message', 'Rotação de chaves solicitada. Implementar processo manual.',
    'timestamp', NOW()
  );
  
  RETURN v_result;
END;
$$;
