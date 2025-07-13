
-- Remover o trigger de criptografia de dados sensíveis
DROP TRIGGER IF EXISTS trigger_encrypt_cliente_sensitive_data ON public.clientes;

-- Remover as funções de criptografia
DROP FUNCTION IF EXISTS public.encrypt_cliente_sensitive_data();
DROP FUNCTION IF EXISTS public.get_cliente_with_decrypted_data(uuid);
DROP FUNCTION IF EXISTS public.migrate_existing_sensitive_data();

-- Remover as funções de criptografia genérica
DROP FUNCTION IF EXISTS public.encrypt_sensitive_data(text, text);
DROP FUNCTION IF EXISTS public.decrypt_sensitive_data(text, text);

-- Limpar todos os dados criptografados existentes, definindo como NULL
UPDATE public.clientes 
SET 
  telefone = NULL,
  usuario_aplicativo = NULL,
  senha_aplicativo = NULL,
  usuario_2 = NULL,
  senha_2 = NULL
WHERE 
  LENGTH(COALESCE(telefone, '')) > 50 OR
  LENGTH(COALESCE(usuario_aplicativo, '')) > 50 OR
  LENGTH(COALESCE(senha_aplicativo, '')) > 50 OR
  LENGTH(COALESCE(usuario_2, '')) > 50 OR
  LENGTH(COALESCE(senha_2, '')) > 50 OR
  telefone ~ '^[a-f0-9]{32,}$' OR
  usuario_aplicativo ~ '^[a-f0-9]{32,}$' OR
  senha_aplicativo ~ '^[a-f0-9]{32,}$' OR
  usuario_2 ~ '^[a-f0-9]{32,}$' OR
  senha_2 ~ '^[a-f0-9]{32,}$';
