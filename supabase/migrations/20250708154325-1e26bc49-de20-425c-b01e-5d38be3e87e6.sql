-- Função para rate limiting de autenticação (login/cadastro)
CREATE OR REPLACE FUNCTION public.check_auth_rate_limit(
  p_email TEXT,
  p_operation TEXT, -- 'login' ou 'signup'
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

-- Função para registrar tentativas de autenticação
CREATE OR REPLACE FUNCTION public.log_auth_attempt(
  p_email TEXT,
  p_operation TEXT, -- 'login' ou 'signup'
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
    NULL, -- Para tentativas de auth, user_id pode ser NULL inicialmente
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

-- Função para validar força de senha
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

-- Função segura para autenticação com rate limiting e auditoria
CREATE OR REPLACE FUNCTION public.secure_auth_attempt(
  p_email TEXT,
  p_password TEXT,
  p_operation TEXT, -- 'login' ou 'signup'
  p_nome TEXT DEFAULT NULL, -- Para signup
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_password_validation JSON;
  v_sanitized_email TEXT;
  v_sanitized_nome TEXT;
BEGIN
  -- Sanitizar email
  v_sanitized_email := LOWER(TRIM(p_email));
  
  -- Verificar rate limiting
  IF NOT public.check_auth_rate_limit(v_sanitized_email, p_operation, 5, 15) THEN
    -- Registrar tentativa bloqueada
    PERFORM public.log_auth_attempt(
      v_sanitized_email,
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
  
  -- Validar email
  IF NOT v_sanitized_email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
    PERFORM public.log_auth_attempt(
      v_sanitized_email,
      p_operation,
      FALSE,
      'Invalid email format',
      p_ip_address,
      p_user_agent
    );
    
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Formato de email inválido'
    );
  END IF;
  
  -- Para signup, validar força da senha
  IF p_operation = 'signup' THEN
    SELECT public.validate_password_strength(p_password) INTO v_password_validation;
    
    IF NOT (v_password_validation->>'valid')::BOOLEAN THEN
      PERFORM public.log_auth_attempt(
        v_sanitized_email,
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
    
    -- Sanitizar nome para signup
    IF p_nome IS NOT NULL THEN
      v_sanitized_nome := TRIM(p_nome);
      v_sanitized_nome := regexp_replace(v_sanitized_nome, '[<>"\''&]', '', 'g');
      
      IF LENGTH(v_sanitized_nome) < 2 THEN
        PERFORM public.log_auth_attempt(
          v_sanitized_email,
          p_operation,
          FALSE,
          'Invalid name',
          p_ip_address,
          p_user_agent
        );
        
        RETURN json_build_object(
          'success', FALSE,
          'error', 'Nome deve ter pelo menos 2 caracteres'
        );
      END IF;
    END IF;
  END IF;
  
  -- Registrar tentativa válida (será atualizada após o resultado real)
  PERFORM public.log_auth_attempt(
    v_sanitized_email,
    p_operation,
    TRUE,
    'Validation passed',
    p_ip_address,
    p_user_agent
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'sanitized_email', v_sanitized_email,
    'sanitized_nome', v_sanitized_nome,
    'password_validation', v_password_validation,
    'message', 'Dados validados com sucesso'
  );
END;
$$;

-- Atualizar a política RLS de audit_logs para permitir inserção de logs de auth sem user_id
DROP POLICY IF EXISTS "Permitir inserção de logs de auditoria" ON public.audit_logs;

CREATE POLICY "Permitir inserção de logs de auditoria incluindo auth"
ON public.audit_logs
FOR INSERT
WITH CHECK (
  -- Permitir inserção se for o próprio usuário OU se for log de auth (user_id NULL)
  auth.uid() = user_id OR 
  (user_id IS NULL AND event_type LIKE 'auth_%')
);