-- Atualizar função de validação para tornar usuario_aplicativo e senha_aplicativo opcionais
CREATE OR REPLACE FUNCTION public.validate_cliente_security(
  p_nome text, 
  p_servidor text, 
  p_dia_vencimento integer, 
  p_aplicativo text, 
  p_usuario_aplicativo text, 
  p_senha_aplicativo text, 
  p_telefone text DEFAULT NULL::text, 
  p_uf text DEFAULT NULL::text, 
  p_valor_plano numeric DEFAULT NULL::numeric, 
  p_user_id uuid DEFAULT NULL::uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_warnings TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Validações obrigatórias críticas
  IF p_nome IS NULL OR LENGTH(TRIM(p_nome)) = 0 THEN
    v_errors := array_append(v_errors, 'Nome é obrigatório');
  ELSIF LENGTH(p_nome) > 40 THEN
    v_errors := array_append(v_errors, 'Nome deve ter no máximo 40 caracteres');
  END IF;
  
  -- Validação de servidor (crítico para funcionamento)
  IF p_servidor IS NULL OR LENGTH(TRIM(p_servidor)) = 0 THEN
    v_errors := array_append(v_errors, 'Servidor é obrigatório');
  ELSIF LENGTH(p_servidor) > 25 THEN
    v_errors := array_append(v_errors, 'Servidor deve ter no máximo 25 caracteres');
  END IF;
  
  -- Validação crítica de dia de vencimento
  IF p_dia_vencimento IS NULL THEN
    v_errors := array_append(v_errors, 'Dia de vencimento é obrigatório');
  ELSIF p_dia_vencimento < 1 OR p_dia_vencimento > 31 THEN
    v_errors := array_append(v_errors, 'Dia de vencimento deve ser entre 1 e 31');
  END IF;
  
  -- Validações de aplicativo (críticas para acesso)
  IF p_aplicativo IS NULL OR LENGTH(TRIM(p_aplicativo)) = 0 THEN
    v_errors := array_append(v_errors, 'Aplicativo é obrigatório');
  ELSIF LENGTH(p_aplicativo) > 25 THEN
    v_errors := array_append(v_errors, 'Aplicativo deve ter no máximo 25 caracteres');
  END IF;
  
  -- CAMPOS TORNADOS OPCIONAIS: usuario_aplicativo e senha_aplicativo não são mais obrigatórios
  -- Isso permite importações de Excel com esses campos vazios
  
  -- Validações de segurança adicionais
  IF p_telefone IS NOT NULL THEN
    -- Remover caracteres não numéricos para validação
    p_telefone := regexp_replace(p_telefone, '[^0-9]', '', 'g');
    
    IF LENGTH(p_telefone) < 10 OR LENGTH(p_telefone) > 11 THEN
      v_errors := array_append(v_errors, 'Telefone deve ter entre 10 e 11 dígitos');
    END IF;
    
    -- Validar padrão brasileiro básico
    IF NOT p_telefone ~ '^[1-9][0-9]{9,10}$' THEN
      v_warnings := array_append(v_warnings, 'Formato de telefone pode estar incorreto');
    END IF;
  END IF;
  
  -- Validação de UF
  IF p_uf IS NOT NULL AND LENGTH(p_uf) > 2 THEN
    v_errors := array_append(v_errors, 'UF deve ter no máximo 2 caracteres');
  END IF;
  
  -- Validação de valor do plano
  IF p_valor_plano IS NOT NULL AND p_valor_plano <= 0 THEN
    v_errors := array_append(v_errors, 'Valor do plano deve ser maior que zero');
  END IF;
  
  -- Validação de autorização (RLS adicional)
  IF p_user_id IS NOT NULL AND p_user_id != auth.uid() THEN
    v_errors := array_append(v_errors, 'Não autorizado a modificar dados de outro usuário');
  END IF;
  
  -- Retornar resultado da validação
  RETURN json_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', COALESCE(v_errors, ARRAY[]::TEXT[]),
    'warnings', COALESCE(v_warnings, ARRAY[]::TEXT[]),
    'sanitized_data', json_build_object(
      'nome', TRIM(p_nome),
      'telefone', CASE WHEN p_telefone IS NOT NULL THEN regexp_replace(p_telefone, '[^0-9]', '', 'g') ELSE NULL END,
      'uf', CASE WHEN p_uf IS NOT NULL THEN UPPER(TRIM(p_uf)) ELSE NULL END,
      'servidor', TRIM(p_servidor),
      'aplicativo', TRIM(p_aplicativo),
      'usuario_aplicativo', CASE WHEN p_usuario_aplicativo IS NOT NULL AND LENGTH(TRIM(p_usuario_aplicativo)) > 0 THEN TRIM(p_usuario_aplicativo) ELSE NULL END,
      'senha_aplicativo', CASE WHEN p_senha_aplicativo IS NOT NULL AND LENGTH(TRIM(p_senha_aplicativo)) > 0 THEN TRIM(p_senha_aplicativo) ELSE NULL END
    )
  );
END;
$$;