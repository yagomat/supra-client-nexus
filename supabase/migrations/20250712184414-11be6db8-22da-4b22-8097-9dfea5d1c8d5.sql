
-- Criar funções específicas para criptografia de senhas de cliente
CREATE OR REPLACE FUNCTION encrypt_cliente_password(p_password text, p_cliente_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key text;
  v_encrypted text;
BEGIN
  -- Gerar chave única baseada no ID do cliente + salt do sistema
  v_key := encode(digest(p_cliente_id::text || 'cliente_password_salt_2024', 'sha256'), 'hex');
  
  -- Criptografar usando a função existente com chave específica
  SELECT encrypt_sensitive_data(p_password, v_key) INTO v_encrypted;
  
  RETURN v_encrypted;
END;
$$;

-- Função para descriptografar senhas de cliente
CREATE OR REPLACE FUNCTION decrypt_cliente_password(p_encrypted_password text, p_cliente_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key text;
  v_decrypted text;
BEGIN
  -- Gerar a mesma chave usada na criptografia
  v_key := encode(digest(p_cliente_id::text || 'cliente_password_salt_2024', 'sha256'), 'hex');
  
  -- Descriptografar usando a função existente
  SELECT decrypt_sensitive_data(p_encrypted_password, v_key) INTO v_decrypted;
  
  RETURN v_decrypted;
END;
$$;

-- Trigger para criptografar automaticamente senhas em INSERT/UPDATE
CREATE OR REPLACE FUNCTION clientes_encrypt_passwords_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criptografar senha_aplicativo se fornecida e não estiver já criptografada
  IF NEW.senha_aplicativo IS NOT NULL AND NEW.senha_aplicativo != '' THEN
    -- Verificar se já está criptografada (assumindo que senhas criptografadas têm formato específico)
    IF NEW.senha_aplicativo !~ '^[a-f0-9]{64,}$' THEN
      NEW.senha_aplicativo := encrypt_cliente_password(NEW.senha_aplicativo, NEW.id);
    END IF;
  END IF;
  
  -- Criptografar senha_2 se fornecida e não estiver já criptografada
  IF NEW.senha_2 IS NOT NULL AND NEW.senha_2 != '' THEN
    IF NEW.senha_2 !~ '^[a-f0-9]{64,}$' THEN
      NEW.senha_2 := encrypt_cliente_password(NEW.senha_2, NEW.id);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para executar antes de INSERT ou UPDATE
DROP TRIGGER IF EXISTS clientes_encrypt_passwords_trigger ON clientes;
CREATE TRIGGER clientes_encrypt_passwords_trigger
  BEFORE INSERT OR UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION clientes_encrypt_passwords_trigger();

-- Função RPC para buscar cliente com senhas descriptografadas (apenas para o proprietário)
CREATE OR REPLACE FUNCTION get_cliente_with_decrypted_passwords(p_cliente_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente RECORD;
  v_result json;
BEGIN
  -- Verificar se o cliente pertence ao usuário logado
  IF NOT cliente_pertence_ao_usuario(p_cliente_id) THEN
    RAISE EXCEPTION 'Acesso negado: cliente não pertence ao usuário';
  END IF;
  
  -- Buscar dados do cliente
  SELECT * INTO v_cliente FROM clientes WHERE id = p_cliente_id;
  
  IF v_cliente IS NULL THEN
    RETURN json_build_object('error', 'Cliente não encontrado');
  END IF;
  
  -- Log da operação para auditoria
  PERFORM log_audit_event(
    auth.uid(),
    'cliente_password_access',
    json_build_object(
      'cliente_id', p_cliente_id,
      'timestamp', NOW()
    )::jsonb
  );
  
  -- Construir resposta com senhas descriptografadas
  v_result := json_build_object(
    'id', v_cliente.id,
    'nome', v_cliente.nome,
    'telefone', v_cliente.telefone,
    'codigo_pais_telefone', v_cliente.codigo_pais_telefone,
    'uf', v_cliente.uf,
    'servidor', v_cliente.servidor,
    'dia_vencimento', v_cliente.dia_vencimento,
    'valor_plano', v_cliente.valor_plano,
    'dispositivo_smart', v_cliente.dispositivo_smart,
    'aplicativo', v_cliente.aplicativo,
    'usuario_aplicativo', v_cliente.usuario_aplicativo,
    'senha_aplicativo', CASE 
      WHEN v_cliente.senha_aplicativo IS NOT NULL AND v_cliente.senha_aplicativo != '' 
      THEN decrypt_cliente_password(v_cliente.senha_aplicativo, v_cliente.id)
      ELSE v_cliente.senha_aplicativo
    END,
    'data_licenca_aplicativo', v_cliente.data_licenca_aplicativo,
    'possui_tela_adicional', v_cliente.possui_tela_adicional,
    'dispositivo_smart_2', v_cliente.dispositivo_smart_2,
    'aplicativo_2', v_cliente.aplicativo_2,
    'usuario_2', v_cliente.usuario_2,
    'senha_2', CASE 
      WHEN v_cliente.senha_2 IS NOT NULL AND v_cliente.senha_2 != '' 
      THEN decrypt_cliente_password(v_cliente.senha_2, v_cliente.id)
      ELSE v_cliente.senha_2
    END,
    'data_licenca_2', v_cliente.data_licenca_2,
    'observacoes', v_cliente.observacoes,
    'status', v_cliente.status,
    'created_at', v_cliente.created_at,
    'user_id', v_cliente.user_id
  );
  
  RETURN v_result;
END;
$$;

-- Função para migrar senhas existentes (criptografar dados atuais)
CREATE OR REPLACE FUNCTION migrate_existing_passwords()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente RECORD;
  v_count_senha_app INTEGER := 0;
  v_count_senha_2 INTEGER := 0;
  v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Verificar se usuário é admin (apenas admin pode executar migração)
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem executar a migração de senhas';
  END IF;
  
  -- Log do início da migração
  PERFORM log_audit_event(
    auth.uid(),
    'password_migration_start',
    json_build_object('timestamp', NOW())::jsonb
  );
  
  -- Processar cada cliente
  FOR v_cliente IN SELECT * FROM clientes WHERE 
    (senha_aplicativo IS NOT NULL AND senha_aplicativo != '' AND senha_aplicativo !~ '^[a-f0-9]{64,}$') OR
    (senha_2 IS NOT NULL AND senha_2 != '' AND senha_2 !~ '^[a-f0-9]{64,}$')
  LOOP
    BEGIN
      -- Migrar senha_aplicativo se não estiver criptografada
      IF v_cliente.senha_aplicativo IS NOT NULL AND v_cliente.senha_aplicativo != '' 
         AND v_cliente.senha_aplicativo !~ '^[a-f0-9]{64,}$' THEN
        
        UPDATE clientes 
        SET senha_aplicativo = encrypt_cliente_password(v_cliente.senha_aplicativo, v_cliente.id)
        WHERE id = v_cliente.id;
        
        v_count_senha_app := v_count_senha_app + 1;
      END IF;
      
      -- Migrar senha_2 se não estiver criptografada
      IF v_cliente.senha_2 IS NOT NULL AND v_cliente.senha_2 != '' 
         AND v_cliente.senha_2 !~ '^[a-f0-9]{64,}$' THEN
        
        UPDATE clientes 
        SET senha_2 = encrypt_cliente_password(v_cliente.senha_2, v_cliente.id)
        WHERE id = v_cliente.id;
        
        v_count_senha_2 := v_count_senha_2 + 1;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      v_errors := array_append(v_errors, 'Erro ao migrar cliente ' || v_cliente.id || ': ' || SQLERRM);
    END;
  END LOOP;
  
  -- Log do fim da migração
  PERFORM log_audit_event(
    auth.uid(),
    'password_migration_complete',
    json_build_object(
      'senhas_app_migradas', v_count_senha_app,
      'senhas_2_migradas', v_count_senha_2,
      'errors', v_errors,
      'timestamp', NOW()
    )::jsonb
  );
  
  RETURN json_build_object(
    'success', TRUE,
    'senhas_aplicativo_migradas', v_count_senha_app,
    'senhas_2_migradas', v_count_senha_2,
    'total_migradas', v_count_senha_app + v_count_senha_2,
    'errors', v_errors
  );
END;
$$;

-- Função auxiliar para logs de auditoria de senhas
CREATE OR REPLACE FUNCTION log_audit_event(p_user_id uuid, p_event_type text, p_details jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_logs (user_id, event_type, details)
  VALUES (p_user_id, p_event_type, p_details);
END;
$$;
