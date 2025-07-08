-- Função para criar cliente com validação de segurança
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
    p_cliente_data->>'servidor',
    (p_cliente_data->>'dia_vencimento')::INTEGER,
    p_cliente_data->>'aplicativo',
    p_cliente_data->>'usuario_aplicativo',
    p_cliente_data->>'senha_aplicativo',
    p_cliente_data->>'telefone',
    p_cliente_data->>'uf',
    CASE WHEN p_cliente_data->>'valor_plano' IS NOT NULL 
         THEN (p_cliente_data->>'valor_plano')::NUMERIC 
         ELSE NULL END,
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

-- Função para atualizar cliente com validação de segurança
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
    p_cliente_data->>'servidor',
    (p_cliente_data->>'dia_vencimento')::INTEGER,
    p_cliente_data->>'aplicativo',
    p_cliente_data->>'usuario_aplicativo',
    p_cliente_data->>'senha_aplicativo',
    p_cliente_data->>'telefone',
    p_cliente_data->>'uf',
    CASE WHEN p_cliente_data->>'valor_plano' IS NOT NULL 
         THEN (p_cliente_data->>'valor_plano')::NUMERIC 
         ELSE NULL END,
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