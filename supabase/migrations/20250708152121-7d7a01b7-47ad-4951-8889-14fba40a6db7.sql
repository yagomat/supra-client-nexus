-- Função para rate limiting de templates WhatsApp
CREATE OR REPLACE FUNCTION public.check_templates_rate_limit(
  p_user_id UUID,
  p_max_requests INTEGER DEFAULT 20,
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
    AND event_type LIKE 'whatsapp_template_%'
    AND created_at > v_time_threshold;
  
  RETURN v_request_count < p_max_requests;
END;
$$;

-- Função para validar e sanitizar conteúdo de templates
CREATE OR REPLACE FUNCTION public.validate_template_content(
  p_mensagem TEXT,
  p_tipo TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_errors TEXT[] := ARRAY[]::TEXT[];
  v_warnings TEXT[] := ARRAY[]::TEXT[];
  v_sanitized_mensagem TEXT;
BEGIN
  -- Validação de tamanho
  IF LENGTH(p_mensagem) > 4000 THEN
    v_errors := array_append(v_errors, 'Mensagem muito longa (máximo 4000 caracteres)');
  END IF;
  
  IF LENGTH(TRIM(p_mensagem)) < 10 THEN
    v_errors := array_append(v_errors, 'Mensagem muito curta (mínimo 10 caracteres)');
  END IF;
  
  -- Sanitização básica
  v_sanitized_mensagem := TRIM(p_mensagem);
  v_sanitized_mensagem := regexp_replace(v_sanitized_mensagem, '<[^>]*>', '', 'g'); -- Remove HTML tags
  
  -- Validação de placeholders permitidos
  IF v_sanitized_mensagem ~ '\{[^}]*\}' THEN
    IF NOT (v_sanitized_mensagem ~ '\{(nome|primeiro_nome|dias_vencimento|data_vencimento|valor_plano)\}') THEN
      v_warnings := array_append(v_warnings, 'Contém placeholders não reconhecidos');
    END IF;
  END IF;
  
  -- Verificar conteúdo suspeito
  IF v_sanitized_mensagem ~* '(script|javascript|onclick|onerror|eval|exec)' THEN
    v_errors := array_append(v_errors, 'Conteúdo suspeito detectado');
  END IF;
  
  RETURN json_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', COALESCE(v_errors, ARRAY[]::TEXT[]),
    'warnings', COALESCE(v_warnings, ARRAY[]::TEXT[]),
    'sanitized_mensagem', v_sanitized_mensagem
  );
END;
$$;

-- Função segura para atualizar templates com auditoria
CREATE OR REPLACE FUNCTION public.secure_update_template(
  p_user_id UUID,
  p_tipo TEXT,
  p_mensagem TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_validation_result JSON;
  v_old_mensagem TEXT;
  v_result JSON;
BEGIN
  -- Verificar rate limiting
  IF NOT public.check_templates_rate_limit(p_user_id, 20, 60) THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Limite de atualizações excedido. Tente novamente em alguns minutos.'
    );
  END IF;
  
  -- Validar e sanitizar conteúdo
  SELECT public.validate_template_content(p_mensagem, p_tipo) INTO v_validation_result;
  
  IF NOT (v_validation_result->>'valid')::BOOLEAN THEN
    RETURN json_build_object(
      'success', FALSE,
      'validation', v_validation_result
    );
  END IF;
  
  -- Buscar mensagem anterior para auditoria
  SELECT mensagem INTO v_old_mensagem
  FROM public.mensagens_whatsapp
  WHERE user_id = p_user_id AND tipo_mensagem = p_tipo;
  
  -- Atualizar template
  INSERT INTO public.mensagens_whatsapp (
    user_id, tipo_mensagem, mensagem, is_template_padrao, updated_at
  ) VALUES (
    p_user_id, p_tipo, v_validation_result->>'sanitized_mensagem', TRUE, NOW()
  )
  ON CONFLICT (user_id, tipo_mensagem)
  DO UPDATE SET
    mensagem = v_validation_result->>'sanitized_mensagem',
    updated_at = NOW();
  
  -- Registrar auditoria
  PERFORM public.log_audit_event(
    p_user_id,
    'whatsapp_template_update',
    jsonb_build_object(
      'tipo', p_tipo,
      'old_mensagem', v_old_mensagem,
      'new_mensagem', v_validation_result->>'sanitized_mensagem',
      'timestamp', NOW()
    )
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'validation', v_validation_result,
    'message', 'Template atualizado com sucesso'
  );
END;
$$;