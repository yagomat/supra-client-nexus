-- Função para validação completa de dados do cliente no backend
CREATE OR REPLACE FUNCTION public.validate_cliente_security(
  p_nome TEXT,
  p_telefone TEXT DEFAULT NULL,
  p_uf TEXT DEFAULT NULL,
  p_servidor TEXT,
  p_dia_vencimento INTEGER,
  p_valor_plano NUMERIC DEFAULT NULL,
  p_aplicativo TEXT,
  p_usuario_aplicativo TEXT,
  p_senha_aplicativo TEXT,
  p_user_id UUID DEFAULT NULL
) RETURNS JSON
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
  
  IF p_usuario_aplicativo IS NULL OR LENGTH(TRIM(p_usuario_aplicativo)) = 0 THEN
    v_errors := array_append(v_errors, 'Usuário do aplicativo é obrigatório');
  END IF;
  
  IF p_senha_aplicativo IS NULL OR LENGTH(TRIM(p_senha_aplicativo)) = 0 THEN
    v_errors := array_append(v_errors, 'Senha do aplicativo é obrigatória');
  END IF;
  
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
      'usuario_aplicativo', TRIM(p_usuario_aplicativo),
      'senha_aplicativo', TRIM(p_senha_aplicativo)
    )
  );
END;
$$;

-- Função para auditoria de operações críticas
CREATE OR REPLACE FUNCTION public.log_cliente_operation(
  p_user_id UUID,
  p_operation TEXT,
  p_cliente_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
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
    p_user_id,
    'cliente_' || p_operation,
    jsonb_build_object(
      'cliente_id', p_cliente_id,
      'operation', p_operation,
      'old_data', p_old_data,
      'new_data', p_new_data,
      'timestamp', NOW()
    ),
    p_ip_address,
    NULL
  );
END;
$$;

-- Função para validar e criar cliente com segurança
CREATE OR REPLACE FUNCTION public.secure_create_cliente(
  p_cliente_data JSONB,
  p_ip_address TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_validation_result JSON;
  v_new_cliente RECORD;
  v_user_id UUID;
BEGIN
  -- Obter ID do usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Usuário não autenticado'
    );
  END IF;
  
  -- Validar dados
  SELECT public.validate_cliente_security(
    p_cliente_data->>'nome',
    p_cliente_data->>'telefone',
    p_cliente_data->>'uf',
    p_cliente_data->>'servidor',
    (p_cliente_data->>'dia_vencimento')::INTEGER,
    CASE WHEN p_cliente_data->>'valor_plano' IS NOT NULL 
         THEN (p_cliente_data->>'valor_plano')::NUMERIC 
         ELSE NULL END,
    p_cliente_data->>'aplicativo',
    p_cliente_data->>'usuario_aplicativo',
    p_cliente_data->>'senha_aplicativo',
    v_user_id
  ) INTO v_validation_result;
  
  -- Se validação falhou, retornar erros
  IF NOT (v_validation_result->>'valid')::BOOLEAN THEN
    RETURN json_build_object(
      'success', FALSE,
      'validation', v_validation_result
    );
  END IF;
  
  -- Inserir cliente com dados sanitizados
  INSERT INTO public.clientes (
    user_id,
    nome,
    telefone,
    codigo_pais_telefone,
    uf,
    servidor,
    dia_vencimento,
    valor_plano,
    dispositivo_smart,
    aplicativo,
    usuario_aplicativo,
    senha_aplicativo,
    data_licenca_aplicativo,
    possui_tela_adicional,
    dispositivo_smart_2,
    aplicativo_2,
    usuario_2,
    senha_2,
    data_licenca_2,
    observacoes
  ) VALUES (
    v_user_id,
    (v_validation_result->'sanitized_data'->>'nome'),
    (v_validation_result->'sanitized_data'->>'telefone'),
    COALESCE(p_cliente_data->>'codigo_pais_telefone', '+55'),
    (v_validation_result->'sanitized_data'->>'uf'),
    (v_validation_result->'sanitized_data'->>'servidor'),
    (p_cliente_data->>'dia_vencimento')::INTEGER,
    CASE WHEN p_cliente_data->>'valor_plano' IS NOT NULL 
         THEN (p_cliente_data->>'valor_plano')::NUMERIC 
         ELSE NULL END,
    p_cliente_data->>'dispositivo_smart',
    (v_validation_result->'sanitized_data'->>'aplicativo'),
    (v_validation_result->'sanitized_data'->>'usuario_aplicativo'),
    (v_validation_result->'sanitized_data'->>'senha_aplicativo'),
    CASE WHEN p_cliente_data->>'data_licenca_aplicativo' IS NOT NULL 
         THEN (p_cliente_data->>'data_licenca_aplicativo')::DATE 
         ELSE NULL END,
    COALESCE((p_cliente_data->>'possui_tela_adicional')::BOOLEAN, FALSE),
    p_cliente_data->>'dispositivo_smart_2',
    p_cliente_data->>'aplicativo_2',
    p_cliente_data->>'usuario_2',
    p_cliente_data->>'senha_2',
    CASE WHEN p_cliente_data->>'data_licenca_2' IS NOT NULL 
         THEN (p_cliente_data->>'data_licenca_2')::DATE 
         ELSE NULL END,
    p_cliente_data->>'observacoes'
  ) RETURNING * INTO v_new_cliente;
  
  -- Log da operação para auditoria
  PERFORM public.log_cliente_operation(
    v_user_id,
    'create',
    v_new_cliente.id,
    NULL,
    to_jsonb(v_new_cliente),
    p_ip_address
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'cliente', to_jsonb(v_new_cliente),
    'validation', v_validation_result
  );
END;
$$;

-- Função para validar e atualizar cliente com segurança
CREATE OR REPLACE FUNCTION public.secure_update_cliente(
  p_cliente_id UUID,
  p_cliente_data JSONB,
  p_ip_address TEXT DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_validation_result JSON;
  v_old_cliente RECORD;
  v_updated_cliente RECORD;
  v_user_id UUID;
BEGIN
  -- Obter ID do usuário autenticado
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Usuário não autenticado'
    );
  END IF;
  
  -- Verificar se o cliente existe e pertence ao usuário
  SELECT * INTO v_old_cliente 
  FROM public.clientes 
  WHERE id = p_cliente_id AND user_id = v_user_id;
  
  IF v_old_cliente IS NULL THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Cliente não encontrado ou não autorizado'
    );
  END IF;
  
  -- Validar dados
  SELECT public.validate_cliente_security(
    p_cliente_data->>'nome',
    p_cliente_data->>'telefone',
    p_cliente_data->>'uf',
    p_cliente_data->>'servidor',
    (p_cliente_data->>'dia_vencimento')::INTEGER,
    CASE WHEN p_cliente_data->>'valor_plano' IS NOT NULL 
         THEN (p_cliente_data->>'valor_plano')::NUMERIC 
         ELSE NULL END,
    p_cliente_data->>'aplicativo',
    p_cliente_data->>'usuario_aplicativo',
    p_cliente_data->>'senha_aplicativo',
    v_user_id
  ) INTO v_validation_result;
  
  -- Se validação falhou, retornar erros
  IF NOT (v_validation_result->>'valid')::BOOLEAN THEN
    RETURN json_build_object(
      'success', FALSE,
      'validation', v_validation_result
    );
  END IF;
  
  -- Atualizar cliente com dados sanitizados
  UPDATE public.clientes SET
    nome = (v_validation_result->'sanitized_data'->>'nome'),
    telefone = (v_validation_result->'sanitized_data'->>'telefone'),
    codigo_pais_telefone = COALESCE(p_cliente_data->>'codigo_pais_telefone', codigo_pais_telefone),
    uf = (v_validation_result->'sanitized_data'->>'uf'),
    servidor = (v_validation_result->'sanitized_data'->>'servidor'),
    dia_vencimento = (p_cliente_data->>'dia_vencimento')::INTEGER,
    valor_plano = CASE WHEN p_cliente_data->>'valor_plano' IS NOT NULL 
                       THEN (p_cliente_data->>'valor_plano')::NUMERIC 
                       ELSE valor_plano END,
    dispositivo_smart = COALESCE(p_cliente_data->>'dispositivo_smart', dispositivo_smart),
    aplicativo = (v_validation_result->'sanitized_data'->>'aplicativo'),
    usuario_aplicativo = (v_validation_result->'sanitized_data'->>'usuario_aplicativo'),
    senha_aplicativo = (v_validation_result->'sanitized_data'->>'senha_aplicativo'),
    data_licenca_aplicativo = CASE WHEN p_cliente_data->>'data_licenca_aplicativo' IS NOT NULL 
                                   THEN (p_cliente_data->>'data_licenca_aplicativo')::DATE 
                                   ELSE data_licenca_aplicativo END,
    possui_tela_adicional = COALESCE((p_cliente_data->>'possui_tela_adicional')::BOOLEAN, possui_tela_adicional),
    dispositivo_smart_2 = CASE WHEN (p_cliente_data->>'possui_tela_adicional')::BOOLEAN 
                               THEN COALESCE(p_cliente_data->>'dispositivo_smart_2', dispositivo_smart_2)
                               ELSE NULL END,
    aplicativo_2 = CASE WHEN (p_cliente_data->>'possui_tela_adicional')::BOOLEAN 
                        THEN COALESCE(p_cliente_data->>'aplicativo_2', aplicativo_2)
                        ELSE NULL END,
    usuario_2 = CASE WHEN (p_cliente_data->>'possui_tela_adicional')::BOOLEAN 
                     THEN COALESCE(p_cliente_data->>'usuario_2', usuario_2)
                     ELSE NULL END,
    senha_2 = CASE WHEN (p_cliente_data->>'possui_tela_adicional')::BOOLEAN 
                   THEN COALESCE(p_cliente_data->>'senha_2', senha_2)
                   ELSE NULL END,
    data_licenca_2 = CASE WHEN (p_cliente_data->>'possui_tela_adicional')::BOOLEAN AND p_cliente_data->>'data_licenca_2' IS NOT NULL
                          THEN (p_cliente_data->>'data_licenca_2')::DATE 
                          ELSE CASE WHEN (p_cliente_data->>'possui_tela_adicional')::BOOLEAN 
                                    THEN data_licenca_2
                                    ELSE NULL END END,
    observacoes = COALESCE(p_cliente_data->>'observacoes', observacoes)
  WHERE id = p_cliente_id
  RETURNING * INTO v_updated_cliente;
  
  -- Log da operação para auditoria
  PERFORM public.log_cliente_operation(
    v_user_id,
    'update',
    p_cliente_id,
    to_jsonb(v_old_cliente),
    to_jsonb(v_updated_cliente),
    p_ip_address
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'cliente', to_jsonb(v_updated_cliente),
    'validation', v_validation_result
  );
END;
$$;

-- Função para rate limiting básico
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_operation TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_time_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_count INTEGER;
  v_time_threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calcular o timestamp limite
  v_time_threshold := NOW() - INTERVAL '1 minute' * p_time_window_minutes;
  
  -- Contar requests no período
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND event_type LIKE 'cliente_%'
    AND created_at > v_time_threshold;
  
  -- Retornar se está dentro do limite
  RETURN v_request_count < p_max_requests;
END;
$$;