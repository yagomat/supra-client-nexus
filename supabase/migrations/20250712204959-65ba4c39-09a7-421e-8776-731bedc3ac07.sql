
-- Atualizar função de validação de senha para nova regra flexível
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
    v_errors := array_append(v_errors, 'A senha deve ter pelo menos 8 caracteres');
  ELSE
    v_score := v_score + 1;
  END IF;
  
  -- Verificar se contém pelo menos uma letra (obrigatório)
  IF p_password ~ '[a-zA-Z]' THEN
    v_score := v_score + 1;
  ELSE
    v_errors := array_append(v_errors, 'A senha deve conter pelo menos uma letra');
  END IF;
  
  -- Verificar se contém pelo menos um número (obrigatório)
  IF p_password ~ '[0-9]' THEN
    v_score := v_score + 1;
  ELSE
    v_errors := array_append(v_errors, 'A senha deve conter pelo menos um número');
  END IF;
  
  -- Verificar letras maiúsculas (opcional - apenas warning)
  IF p_password ~ '[A-Z]' THEN
    v_score := v_score + 1;
  ELSE
    v_warnings := array_append(v_warnings, 'Recomendado: usar pelo menos uma letra maiúscula');
  END IF;
  
  -- Verificar caracteres especiais (opcional - apenas warning)
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
  
  -- Determinar força baseada no score (ajustado para nova lógica)
  IF v_score >= 4 THEN
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
