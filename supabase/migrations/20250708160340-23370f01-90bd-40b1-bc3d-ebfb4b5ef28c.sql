-- Criar funções de validação centralizadas no backend

-- Função para validar dados de cliente (centralizada)
CREATE OR REPLACE FUNCTION public.validate_cliente_data_centralized(
  p_nome TEXT,
  p_telefone TEXT DEFAULT NULL,
  p_uf TEXT DEFAULT NULL,
  p_servidor TEXT,
  p_dia_vencimento INTEGER,
  p_valor_plano NUMERIC DEFAULT NULL,
  p_aplicativo TEXT,
  p_usuario_aplicativo TEXT,
  p_senha_aplicativo TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_warnings TEXT[] := ARRAY[]::TEXT[];
  v_sanitized_data JSON;
BEGIN
  -- Validações obrigatórias
  IF p_nome IS NULL OR LENGTH(TRIM(p_nome)) = 0 THEN
    v_errors := array_append(v_errors, 'Nome é obrigatório');
  ELSIF LENGTH(TRIM(p_nome)) > 40 THEN
    v_errors := array_append(v_errors, 'Nome deve ter no máximo 40 caracteres');
  END IF;
  
  IF p_servidor IS NULL OR LENGTH(TRIM(p_servidor)) = 0 THEN
    v_errors := array_append(v_errors, 'Servidor é obrigatório');
  ELSIF LENGTH(TRIM(p_servidor)) > 25 THEN
    v_errors := array_append(v_errors, 'Servidor deve ter no máximo 25 caracteres');
  END IF;
  
  IF p_dia_vencimento IS NULL THEN
    v_errors := array_append(v_errors, 'Dia de vencimento é obrigatório');
  ELSIF p_dia_vencimento < 1 OR p_dia_vencimento > 31 THEN
    v_errors := array_append(v_errors, 'Dia de vencimento deve ser entre 1 e 31');
  END IF;
  
  IF p_aplicativo IS NULL OR LENGTH(TRIM(p_aplicativo)) = 0 THEN
    v_errors := array_append(v_errors, 'Aplicativo é obrigatório');
  ELSIF LENGTH(TRIM(p_aplicativo)) > 25 THEN
    v_errors := array_append(v_errors, 'Aplicativo deve ter no máximo 25 caracteres');
  END IF;
  
  IF p_usuario_aplicativo IS NULL OR LENGTH(TRIM(p_usuario_aplicativo)) = 0 THEN
    v_errors := array_append(v_errors, 'Usuário do aplicativo é obrigatório');
  END IF;
  
  IF p_senha_aplicativo IS NULL OR LENGTH(TRIM(p_senha_aplicativo)) = 0 THEN
    v_errors := array_append(v_errors, 'Senha do aplicativo é obrigatória');
  END IF;
  
  -- Validações opcionais
  IF p_telefone IS NOT NULL AND LENGTH(p_telefone) > 0 THEN
    -- Remover caracteres não numéricos
    p_telefone := regexp_replace(p_telefone, '[^0-9]', '', 'g');
    IF LENGTH(p_telefone) < 10 OR LENGTH(p_telefone) > 11 THEN
      v_errors := array_append(v_errors, 'Telefone deve ter entre 10 e 11 dígitos');
    END IF;
  END IF;
  
  IF p_uf IS NOT NULL AND LENGTH(p_uf) > 0 THEN
    p_uf := UPPER(TRIM(p_uf));
    IF LENGTH(p_uf) != 2 THEN
      v_errors := array_append(v_errors, 'UF deve ter exatamente 2 caracteres');
    ELSIF p_uf NOT IN ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO') THEN
      v_errors := array_append(v_errors, 'UF informada não é válida');
    END IF;
  END IF;
  
  IF p_valor_plano IS NOT NULL AND p_valor_plano <= 0 THEN
    v_errors := array_append(v_errors, 'Valor do plano deve ser maior que zero');
  END IF;
  
  -- Dados sanitizados
  v_sanitized_data := json_build_object(
    'nome', TRIM(p_nome),
    'telefone', CASE WHEN p_telefone IS NOT NULL THEN regexp_replace(p_telefone, '[^0-9]', '', 'g') ELSE NULL END,
    'uf', CASE WHEN p_uf IS NOT NULL THEN UPPER(TRIM(p_uf)) ELSE NULL END,
    'servidor', TRIM(p_servidor),
    'dia_vencimento', p_dia_vencimento,
    'valor_plano', p_valor_plano,
    'aplicativo', TRIM(p_aplicativo),
    'usuario_aplicativo', TRIM(p_usuario_aplicativo),
    'senha_aplicativo', TRIM(p_senha_aplicativo)
  );
  
  RETURN json_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', COALESCE(v_errors, ARRAY[]::TEXT[]),
    'warnings', COALESCE(v_warnings, ARRAY[]::TEXT[]),
    'sanitized_data', v_sanitized_data
  );
END;
$$;

-- Função para validar valores predefinidos (centralizada)
CREATE OR REPLACE FUNCTION public.validate_valor_predefinido_centralized(
  p_tipo TEXT,
  p_valor TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_normalized_value TEXT;
  v_numeric_value NUMERIC;
  v_integer_value INTEGER;
BEGIN
  -- Validar tipo
  IF p_tipo NOT IN ('ufs', 'servidores', 'dias_vencimento', 'valores_plano', 'dispositivos_smart', 'aplicativos') THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Tipo de valor não reconhecido',
      'code', 'INVALID_TYPE'
    );
  END IF;
  
  -- Validar valor vazio
  IF p_valor IS NULL OR LENGTH(TRIM(p_valor)) = 0 THEN
    RETURN json_build_object(
      'valid', false,
      'error', 'Valor não pode estar vazio',
      'code', 'EMPTY_VALUE'
    );
  END IF;
  
  -- Validações específicas por tipo
  CASE p_tipo
    WHEN 'ufs' THEN
      v_normalized_value := UPPER(TRIM(p_valor));
      IF LENGTH(v_normalized_value) != 2 THEN
        RETURN json_build_object(
          'valid', false,
          'error', 'UF deve ter exatamente 2 caracteres',
          'code', 'INVALID_LENGTH'
        );
      END IF;
      IF v_normalized_value NOT IN ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO') THEN
        RETURN json_build_object(
          'valid', false,
          'error', 'UF informada não é válida',
          'code', 'INVALID_UF'
        );
      END IF;
      
    WHEN 'dias_vencimento' THEN
      BEGIN
        v_integer_value := p_valor::INTEGER;
        IF v_integer_value < 1 OR v_integer_value > 31 THEN
          RETURN json_build_object(
            'valid', false,
            'error', 'Dia de vencimento deve ser entre 1 e 31',
            'code', 'INVALID_RANGE'
          );
        END IF;
        v_normalized_value := v_integer_value::TEXT;
      EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
          'valid', false,
          'error', 'Dia de vencimento deve ser um número inteiro válido',
          'code', 'INVALID_NUMBER'
        );
      END;
      
    WHEN 'valores_plano' THEN
      BEGIN
        v_numeric_value := REPLACE(p_valor, ',', '.')::NUMERIC;
        IF v_numeric_value <= 0 THEN
          RETURN json_build_object(
            'valid', false,
            'error', 'Valor do plano deve ser maior que zero',
            'code', 'INVALID_RANGE'
          );
        END IF;
        IF v_numeric_value > 1000 THEN
          RETURN json_build_object(
            'valid', false,
            'error', 'Valor do plano deve ser no máximo R$ 1.000,00',
            'code', 'INVALID_RANGE'
          );
        END IF;
        v_normalized_value := ROUND(v_numeric_value, 2)::TEXT;
      EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object(
          'valid', false,
          'error', 'Valor do plano deve ser um número válido',
          'code', 'INVALID_NUMBER'
        );
      END;
      
    WHEN 'servidores', 'dispositivos_smart', 'aplicativos' THEN
      v_normalized_value := TRIM(p_valor);
      IF LENGTH(v_normalized_value) > 25 THEN
        RETURN json_build_object(
          'valid', false,
          'error', 'Valor deve ter no máximo 25 caracteres',
          'code', 'INVALID_LENGTH'
        );
      END IF;
      IF NOT (v_normalized_value ~ '^[a-zA-Z0-9\sçÇáàâãéèêíìîóòôõúùûüÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÜ._-]+$') THEN
        RETURN json_build_object(
          'valid', false,
          'error', 'Valor contém caracteres não permitidos',
          'code', 'INVALID_CHARACTERS'
        );
      END IF;
  END CASE;
  
  RETURN json_build_object(
    'valid', true,
    'normalized_value', v_normalized_value,
    'code', 'SUCCESS'
  );
END;
$$;

-- Função para obter configuração de validação
CREATE OR REPLACE FUNCTION public.get_validation_config()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'tipos', json_build_object(
      'ufs', json_build_object(
        'tipo', 'string',
        'maxLength', 2,
        'maxItemsPerOperation', 10,
        'description', 'Estados brasileiros (sigla)',
        'example', 'SP;RJ;MG'
      ),
      'servidores', json_build_object(
        'tipo', 'string',
        'maxLength', 25,
        'maxItemsPerOperation', 10,
        'description', 'Nomes de servidores',
        'example', 'Servidor1;Servidor2'
      ),
      'dias_vencimento', json_build_object(
        'tipo', 'integer',
        'minValue', 1,
        'maxValue', 31,
        'maxItemsPerOperation', 10,
        'description', 'Dias de vencimento (1-31)',
        'example', '10;15;20'
      ),
      'valores_plano', json_build_object(
        'tipo', 'decimal',
        'minValue', 0.01,
        'maxValue', 1000,
        'decimalPlaces', 2,
        'maxItemsPerOperation', 10,
        'description', 'Valores de plano (até R$ 1.000)',
        'example', '49.90;99.90;199.90'
      ),
      'dispositivos_smart', json_build_object(
        'tipo', 'string',
        'maxLength', 25,
        'maxItemsPerOperation', 10,
        'description', 'Nomes de dispositivos',
        'example', 'TV Box;Smart TV'
      ),
      'aplicativos', json_build_object(
        'tipo', 'string',
        'maxLength', 25,
        'maxItemsPerOperation', 10,
        'description', 'Nomes de aplicativos',
        'example', 'Netflix;YouTube'
      )
    ),
    'ufsValidas', ARRAY['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
  );
END;
$$;

-- Função para sanitização centralizada
CREATE OR REPLACE FUNCTION public.sanitize_input_centralized(
  p_input TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remover tags HTML básicas e caracteres perigosos
  p_input := regexp_replace(p_input, '<[^>]*>', '', 'g');
  p_input := regexp_replace(p_input, '[<>"\''&]', '', 'g');
  p_input := TRIM(p_input);
  
  RETURN p_input;
END;
$$;