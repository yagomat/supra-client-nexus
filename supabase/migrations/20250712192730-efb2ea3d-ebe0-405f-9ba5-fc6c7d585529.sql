
-- Create encryption/decryption functions for sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_data(p_data text, p_key text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key text;
  v_encrypted text;
BEGIN
  -- Use provided key or generate a default one
  v_key := COALESCE(p_key, encode(digest('sensitive_data_encryption_key_2024', 'sha256'), 'hex'));
  
  -- Simple encryption using pgcrypto
  SELECT encode(encrypt(p_data::bytea, v_key::bytea, 'aes'), 'hex') INTO v_encrypted;
  
  RETURN v_encrypted;
EXCEPTION
  WHEN OTHERS THEN
    -- If encryption fails, return original data (for development)
    RETURN p_data;
END;
$$;

-- Create decryption function
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_data(p_encrypted_data text, p_key text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_key text;
  v_decrypted text;
BEGIN
  -- Use provided key or generate the default one
  v_key := COALESCE(p_key, encode(digest('sensitive_data_encryption_key_2024', 'sha256'), 'hex'));
  
  -- Simple decryption using pgcrypto
  SELECT convert_from(decrypt(decode(p_encrypted_data, 'hex'), v_key::bytea, 'aes'), 'UTF8') INTO v_decrypted;
  
  RETURN v_decrypted;
EXCEPTION
  WHEN OTHERS THEN
    -- If decryption fails, return encrypted data (for safety)
    RETURN p_encrypted_data;
END;
$$;

-- Create function to get cliente with decrypted sensitive data
CREATE OR REPLACE FUNCTION public.get_cliente_with_decrypted_data(p_cliente_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cliente RECORD;
  v_result json;
BEGIN
  -- Verify user owns this cliente
  IF NOT EXISTS (
    SELECT 1 FROM public.clientes 
    WHERE id = p_cliente_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Cliente não encontrado ou não autorizado';
  END IF;
  
  -- Get cliente data
  SELECT * INTO v_cliente
  FROM public.clientes
  WHERE id = p_cliente_id AND user_id = auth.uid();
  
  -- Build result with decrypted sensitive fields
  v_result := json_build_object(
    'id', v_cliente.id,
    'user_id', v_cliente.user_id,
    'nome', v_cliente.nome,
    'telefone', CASE 
      WHEN v_cliente.telefone IS NOT NULL AND v_cliente.telefone != '' 
      THEN public.decrypt_sensitive_data(v_cliente.telefone)
      ELSE v_cliente.telefone 
    END,
    'codigo_pais_telefone', v_cliente.codigo_pais_telefone,
    'uf', v_cliente.uf,
    'servidor', v_cliente.servidor,
    'dia_vencimento', v_cliente.dia_vencimento,
    'valor_plano', v_cliente.valor_plano,
    'dispositivo_smart', v_cliente.dispositivo_smart,
    'aplicativo', v_cliente.aplicativo,
    'usuario_aplicativo', CASE 
      WHEN v_cliente.usuario_aplicativo IS NOT NULL AND v_cliente.usuario_aplicativo != '' 
      THEN public.decrypt_sensitive_data(v_cliente.usuario_aplicativo)
      ELSE v_cliente.usuario_aplicativo 
    END,
    'senha_aplicativo', CASE 
      WHEN v_cliente.senha_aplicativo IS NOT NULL AND v_cliente.senha_aplicativo != '' 
      THEN public.decrypt_sensitive_data(v_cliente.senha_aplicativo)
      ELSE v_cliente.senha_aplicativo 
    END,
    'data_licenca_aplicativo', v_cliente.data_licenca_aplicativo,
    'possui_tela_adicional', v_cliente.possui_tela_adicional,
    'dispositivo_smart_2', v_cliente.dispositivo_smart_2,
    'aplicativo_2', v_cliente.aplicativo_2,
    'usuario_2', CASE 
      WHEN v_cliente.usuario_2 IS NOT NULL AND v_cliente.usuario_2 != '' 
      THEN public.decrypt_sensitive_data(v_cliente.usuario_2)
      ELSE v_cliente.usuario_2 
    END,
    'senha_2', CASE 
      WHEN v_cliente.senha_2 IS NOT NULL AND v_cliente.senha_2 != '' 
      THEN public.decrypt_sensitive_data(v_cliente.senha_2)
      ELSE v_cliente.senha_2 
    END,
    'data_licenca_2', v_cliente.data_licenca_2,
    'observacoes', v_cliente.observacoes,
    'status', v_cliente.status,
    'created_at', v_cliente.created_at
  );
  
  RETURN v_result;
END;
$$;

-- Create trigger function to encrypt sensitive data before INSERT/UPDATE
CREATE OR REPLACE FUNCTION public.encrypt_cliente_sensitive_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Encrypt telefone if provided and not already encrypted
  IF NEW.telefone IS NOT NULL AND NEW.telefone != '' THEN
    -- Check if already encrypted (hex pattern)
    IF NEW.telefone !~ '^[a-f0-9]{32,}$' THEN
      NEW.telefone := public.encrypt_sensitive_data(NEW.telefone);
    END IF;
  END IF;
  
  -- Encrypt usuario_aplicativo if provided and not already encrypted
  IF NEW.usuario_aplicativo IS NOT NULL AND NEW.usuario_aplicativo != '' THEN
    IF NEW.usuario_aplicativo !~ '^[a-f0-9]{32,}$' THEN
      NEW.usuario_aplicativo := public.encrypt_sensitive_data(NEW.usuario_aplicativo);
    END IF;
  END IF;
  
  -- Encrypt senha_aplicativo if provided and not already encrypted
  IF NEW.senha_aplicativo IS NOT NULL AND NEW.senha_aplicativo != '' THEN
    IF NEW.senha_aplicativo !~ '^[a-f0-9]{32,}$' THEN
      NEW.senha_aplicativo := public.encrypt_sensitive_data(NEW.senha_aplicativo);
    END IF;
  END IF;
  
  -- Encrypt usuario_2 if provided and not already encrypted
  IF NEW.usuario_2 IS NOT NULL AND NEW.usuario_2 != '' THEN
    IF NEW.usuario_2 !~ '^[a-f0-9]{32,}$' THEN
      NEW.usuario_2 := public.encrypt_sensitive_data(NEW.usuario_2);
    END IF;
  END IF;
  
  -- Encrypt senha_2 if provided and not already encrypted
  IF NEW.senha_2 IS NOT NULL AND NEW.senha_2 != '' THEN
    IF NEW.senha_2 !~ '^[a-f0-9]{32,}$' THEN
      NEW.senha_2 := public.encrypt_sensitive_data(NEW.senha_2);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger to automatically encrypt data
DROP TRIGGER IF EXISTS trigger_encrypt_cliente_sensitive_data ON public.clientes;
CREATE TRIGGER trigger_encrypt_cliente_sensitive_data
  BEFORE INSERT OR UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.encrypt_cliente_sensitive_data();

-- Create function to migrate existing sensitive data
CREATE OR REPLACE FUNCTION public.migrate_existing_sensitive_data()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER := 0;
  v_cliente RECORD;
  v_updated INTEGER := 0;
BEGIN
  -- Count total clientes
  SELECT COUNT(*) INTO v_count FROM public.clientes;
  
  -- Process each cliente to encrypt sensitive data
  FOR v_cliente IN 
    SELECT * FROM public.clientes 
    WHERE user_id = auth.uid()
  LOOP
    -- Update cliente with encrypted sensitive data
    UPDATE public.clientes SET
      telefone = CASE 
        WHEN telefone IS NOT NULL AND telefone != '' AND telefone !~ '^[a-f0-9]{32,}$'
        THEN public.encrypt_sensitive_data(telefone)
        ELSE telefone 
      END,
      usuario_aplicativo = CASE 
        WHEN usuario_aplicativo IS NOT NULL AND usuario_aplicativo != '' AND usuario_aplicativo !~ '^[a-f0-9]{32,}$'
        THEN public.encrypt_sensitive_data(usuario_aplicativo)
        ELSE usuario_aplicativo 
      END,
      senha_aplicativo = CASE 
        WHEN senha_aplicativo IS NOT NULL AND senha_aplicativo != '' AND senha_aplicativo !~ '^[a-f0-9]{32,}$'
        THEN public.encrypt_sensitive_data(senha_aplicativo)
        ELSE senha_aplicativo 
      END,
      usuario_2 = CASE 
        WHEN usuario_2 IS NOT NULL AND usuario_2 != '' AND usuario_2 !~ '^[a-f0-9]{32,}$'
        THEN public.encrypt_sensitive_data(usuario_2)
        ELSE usuario_2 
      END,
      senha_2 = CASE 
        WHEN senha_2 IS NOT NULL AND senha_2 != '' AND senha_2 !~ '^[a-f0-9]{32,}$'
        THEN public.encrypt_sensitive_data(senha_2)
        ELSE senha_2 
      END
    WHERE id = v_cliente.id;
    
    v_updated := v_updated + 1;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Migração concluída com sucesso',
    'total_clientes', v_count,
    'clientes_processados', v_updated,
    'user_id', auth.uid()
  );
END;
$$;
