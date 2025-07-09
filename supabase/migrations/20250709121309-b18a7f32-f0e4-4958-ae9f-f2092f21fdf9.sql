-- Refatoração: Dividir funções de autenticação em componentes menores e mais focados

-- 1. Função específica para rate limiting de autenticação
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
  p_email TEXT,
  p_operation TEXT,
  p_max_requests INTEGER DEFAULT 5,
  p_time_window_minutes INTEGER DEFAULT 15
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
  WHERE event_type = ('auth_' || p_operation || '_attempt')
    AND details->>'email' = p_email
    AND created_at > v_time_threshold;
  
  RETURN v_request_count < p_max_requests;
END;
$$;

-- 2. Função específica para logging de autenticação
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  p_email TEXT,
  p_operation TEXT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    event_type,
    details,
    ip_address,
    user_agent
  ) VALUES (
    NULL,
    'auth_' || p_operation || '_attempt',
    jsonb_build_object(
      'email', p_email,
      'success', p_success,
      'error_message', p_error_message,
      'timestamp', NOW(),
      'operation', p_operation
    ),
    p_ip_address,
    p_user_agent
  );
END;
$$;

-- 3. Função específica para validação de força de senha
CREATE OR REPLACE FUNCTION public.validate_password_strength(
  p_password TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_warnings TEXT[] := ARRAY[]::TEXT[];
  v_score INTEGER := 0;
  v_strength TEXT;
BEGIN
  -- Validações básicas obrigatórias
  IF LENGTH(p_password) < 8 THEN
    v_errors := array_append(v_errors, 'Senha deve ter pelo menos 8 caracteres');
  ELSE
    v_score := v_score + 1;
  END IF;
  
  -- Verificar letras minúsculas
  IF p_password ~ '[a-z]' THEN
    v_score := v_score + 1;
  ELSE
    v_errors := array_append(v_errors, 'Senha deve conter pelo menos uma letra minúscula');
  END IF;
  
  -- Verificar letras maiúsculas
  IF p_password ~ '[A-Z]' THEN
    v_score := v_score + 1;
  ELSE
    v_warnings := array_append(v_warnings, 'Recomendado: usar pelo menos uma letra maiúscula');
  END IF;
  
  -- Verificar números
  IF p_password ~ '[0-9]' THEN
    v_score := v_score + 1;
  ELSE
    v_warnings := array_append(v_warnings, 'Recomendado: usar pelo menos um número');
  END IF;
  
  -- Verificar caracteres especiais
  IF p_password ~ '[^a-zA-Z0-9]' THEN
    v_score := v_score + 1;
  ELSE
    v_warnings := array_append(v_warnings, 'Recomendado: usar pelo menos um caractere especial');
  END IF;
  
  -- Verificar comprimento extra
  IF LENGTH(p_password) >= 12 THEN
    v_score := v_score + 1;
  END IF;
  
  -- Verificar padrões comuns fracos
  IF p_password ~* '(password|123456|qwerty|abc|admin)' THEN
    v_errors := array_append(v_errors, 'Senha contém padrões muito comuns');
    v_score := GREATEST(v_score - 2, 0);
  END IF;
  
  -- Determinar força baseada no score
  IF v_score >= 5 THEN
    v_strength := 'forte';
  ELSIF v_score >= 3 THEN
    v_strength := 'média';
  ELSE
    v_strength := 'fraca';
  END IF;
  
  RETURN json_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', COALESCE(v_errors, ARRAY[]::TEXT[]),
    'warnings', COALESCE(v_warnings, ARRAY[]::TEXT[]),
    'strength', v_strength,
    'score', v_score
  );
END;
$$;

-- 4. Função para sanitização de dados de entrada
CREATE OR REPLACE FUNCTION public.sanitize_auth_input(
  p_email TEXT,
  p_nome TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sanitized_email TEXT;
  v_sanitized_nome TEXT;
  v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Sanitizar email
  v_sanitized_email := LOWER(TRIM(p_email));
  
  -- Validar email
  IF NOT v_sanitized_email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    v_errors := array_append(v_errors, 'Formato de email inválido');
  END IF;
  
  -- Sanitizar nome se fornecido
  IF p_nome IS NOT NULL THEN
    v_sanitized_nome := TRIM(p_nome);
    v_sanitized_nome := regexp_replace(v_sanitized_nome, '[<>"\''&]', '', 'g');
    
    IF LENGTH(v_sanitized_nome) < 2 THEN
      v_errors := array_append(v_errors, 'Nome deve ter pelo menos 2 caracteres');
    END IF;
  END IF;
  
  RETURN json_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', COALESCE(v_errors, ARRAY[]::TEXT[]),
    'sanitized_email', v_sanitized_email,
    'sanitized_nome', v_sanitized_nome
  );
END;
$$;

-- 5. Função principal refatorada para autenticação segura
CREATE OR REPLACE FUNCTION public.secure_auth_attempt(
  p_email TEXT,
  p_password TEXT,
  p_operation TEXT,
  p_nome TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sanitization_result JSON;
  v_password_validation JSON;
BEGIN
  -- Verificar rate limiting
  IF NOT public.check_auth_rate_limit(p_email, p_operation, 5, 15) THEN
    PERFORM public.log_auth_attempt(
      p_email,
      p_operation,
      FALSE,
      'Rate limit exceeded',
      p_ip_address,
      p_user_agent
    );
    
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Muitas tentativas. Tente novamente em 15 minutos.',
      'rate_limited', TRUE
    );
  END IF;
  
  -- Sanitizar dados de entrada
  SELECT public.sanitize_auth_input(p_email, p_nome) INTO v_sanitization_result;
  
  IF NOT (v_sanitization_result->>'valid')::BOOLEAN THEN
    PERFORM public.log_auth_attempt(
      p_email,
      p_operation,
      FALSE,
      'Invalid input data',
      p_ip_address,
      p_user_agent
    );
    
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Dados de entrada inválidos',
      'validation_errors', v_sanitization_result->'errors'
    );
  END IF;
  
  -- Para signup, validar força da senha
  IF p_operation = 'signup' THEN
    SELECT public.validate_password_strength(p_password) INTO v_password_validation;
    
    IF NOT (v_password_validation->>'valid')::BOOLEAN THEN
      PERFORM public.log_auth_attempt(
        v_sanitization_result->>'sanitized_email',
        p_operation,
        FALSE,
        'Weak password',
        p_ip_address,
        p_user_agent
      );
      
      RETURN json_build_object(
        'success', FALSE,
        'error', 'Senha não atende aos critérios de segurança',
        'password_validation', v_password_validation
      );
    END IF;
  END IF;
  
  -- Registrar tentativa válida
  PERFORM public.log_auth_attempt(
    v_sanitization_result->>'sanitized_email',
    p_operation,
    TRUE,
    'Validation passed',
    p_ip_address,
    p_user_agent
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'sanitized_email', v_sanitization_result->>'sanitized_email',
    'sanitized_nome', v_sanitization_result->>'sanitized_nome',
    'password_validation', v_password_validation,
    'message', 'Dados validados com sucesso'
  );
END;
$$;