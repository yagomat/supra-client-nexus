-- Função para rate limiting de atualizações de perfil
CREATE OR REPLACE FUNCTION public.check_profile_rate_limit(
  p_user_id UUID,
  p_max_requests INTEGER DEFAULT 10,
  p_time_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND event_type LIKE 'profile_%'
    AND created_at > v_time_threshold;
  
  RETURN v_request_count < p_max_requests;
END;
$$;

-- Função para validar e sanitizar dados de perfil
CREATE OR REPLACE FUNCTION public.validate_profile_data(
  p_nome TEXT,
  p_telefone TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_warnings TEXT[] := ARRAY[]::TEXT[];
  v_sanitized_nome TEXT;
  v_sanitized_telefone TEXT;
BEGIN
  -- Validação e sanitização do nome
  IF p_nome IS NULL OR LENGTH(TRIM(p_nome)) < 2 THEN
    v_errors := array_append(v_errors, 'Nome deve ter pelo menos 2 caracteres');
  ELSIF LENGTH(TRIM(p_nome)) > 100 THEN
    v_errors := array_append(v_errors, 'Nome deve ter no máximo 100 caracteres');
  ELSE
    -- Sanitizar nome: remover caracteres especiais suspeitos
    v_sanitized_nome := TRIM(p_nome);
    v_sanitized_nome := regexp_replace(v_sanitized_nome, '[<>"\''&]', '', 'g');
    
    -- Verificar se contém apenas caracteres válidos para nomes
    IF NOT v_sanitized_nome ~ '^[a-zA-ZÀ-ÿ\s\-\.]+$' THEN
      v_warnings := array_append(v_warnings, 'Nome contém caracteres inválidos que foram removidos');
      v_sanitized_nome := regexp_replace(v_sanitized_nome, '[^a-zA-ZÀ-ÿ\s\-\.]', '', 'g');
    END IF;
  END IF;
  
  -- Validação e sanitização do telefone
  IF p_telefone IS NOT NULL AND LENGTH(TRIM(p_telefone)) > 0 THEN
    -- Remover caracteres não numéricos exceto + - ( ) e espaços
    v_sanitized_telefone := regexp_replace(TRIM(p_telefone), '[^0-9+\-\(\)\s]', '', 'g');
    
    -- Validar formato básico
    IF LENGTH(regexp_replace(v_sanitized_telefone, '[^0-9]', '', 'g')) < 10 THEN
      v_errors := array_append(v_errors, 'Telefone deve ter pelo menos 10 dígitos');
    ELSIF LENGTH(regexp_replace(v_sanitized_telefone, '[^0-9]', '', 'g')) > 15 THEN
      v_errors := array_append(v_errors, 'Telefone deve ter no máximo 15 dígitos');
    END IF;
    
    -- Validar padrão brasileiro básico se não tiver código de país
    IF NOT v_sanitized_telefone ~ '^\+' AND LENGTH(regexp_replace(v_sanitized_telefone, '[^0-9]', '', 'g')) = 11 THEN
      IF NOT regexp_replace(v_sanitized_telefone, '[^0-9]', '', 'g') ~ '^[1-9][1-9][9][0-9]{8}$' THEN
        v_warnings := array_append(v_warnings, 'Formato de telefone pode estar incorreto para celular brasileiro');
      END IF;
    END IF;
  ELSE
    v_sanitized_telefone := NULL;
  END IF;
  
  -- Verificar conteúdo suspeito
  IF (v_sanitized_nome IS NOT NULL AND v_sanitized_nome ~* '(script|javascript|onclick|onerror|eval|exec)') OR
     (v_sanitized_telefone IS NOT NULL AND v_sanitized_telefone ~* '(script|javascript|onclick|onerror|eval|exec)') THEN
    v_errors := array_append(v_errors, 'Conteúdo suspeito detectado');
  END IF;
  
  RETURN json_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', COALESCE(v_errors, ARRAY[]::TEXT[]),
    'warnings', COALESCE(v_warnings, ARRAY[]::TEXT[]),
    'sanitized_data', json_build_object(
      'nome', v_sanitized_nome,
      'telefone', v_sanitized_telefone
    )
  );
END;
$$;

-- Função segura para atualizar perfil com auditoria
CREATE OR REPLACE FUNCTION public.secure_update_profile(
  p_user_id UUID,
  p_nome TEXT,
  p_telefone TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_validation_result JSON;
  v_old_profile RECORD;
  v_updated_profile RECORD;
BEGIN
  -- Verificar autenticação
  IF p_user_id != auth.uid() THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Não autorizado'
    );
  END IF;
  
  -- Verificar rate limiting
  IF NOT public.check_profile_rate_limit(p_user_id, 10, 60) THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Limite de atualizações excedido. Tente novamente em alguns minutos.'
    );
  END IF;
  
  -- Validar e sanitizar dados
  SELECT public.validate_profile_data(p_nome, p_telefone) INTO v_validation_result;
  
  IF NOT (v_validation_result->>'valid')::BOOLEAN THEN
    RETURN json_build_object(
      'success', FALSE,
      'validation', v_validation_result
    );
  END IF;
  
  -- Buscar dados anteriores para auditoria
  SELECT * INTO v_old_profile
  FROM public.profiles
  WHERE id = p_user_id;
  
  -- Atualizar perfil na tabela profiles
  INSERT INTO public.profiles (
    id, nome, telefone
  ) VALUES (
    p_user_id, 
    v_validation_result->'sanitized_data'->>'nome',
    v_validation_result->'sanitized_data'->>'telefone'
  )
  ON CONFLICT (id)
  DO UPDATE SET
    nome = v_validation_result->'sanitized_data'->>'nome',
    telefone = v_validation_result->'sanitized_data'->>'telefone'
  RETURNING * INTO v_updated_profile;
  
  -- Atualizar nome no metadata do usuário auth
  IF v_validation_result->'sanitized_data'->>'nome' IS NOT NULL THEN
    -- Isso será feito no frontend via supabase.auth.updateUser
    NULL;
  END IF;
  
  -- Registrar auditoria
  PERFORM public.log_audit_event(
    p_user_id,
    'profile_update',
    jsonb_build_object(
      'old_nome', v_old_profile.nome,
      'new_nome', v_validation_result->'sanitized_data'->>'nome',
      'old_telefone', v_old_profile.telefone,
      'new_telefone', v_validation_result->'sanitized_data'->>'telefone',
      'timestamp', NOW()
    )
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'profile', to_jsonb(v_updated_profile),
    'validation', v_validation_result,
    'message', 'Perfil atualizado com sucesso'
  );
END;
$$;