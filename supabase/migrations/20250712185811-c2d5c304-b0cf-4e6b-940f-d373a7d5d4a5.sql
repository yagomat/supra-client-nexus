
-- Remover o trigger de criptografia de senhas
DROP TRIGGER IF EXISTS clientes_encrypt_passwords ON public.clientes;

-- Remover as funções de criptografia de senhas
DROP FUNCTION IF EXISTS public.clientes_encrypt_passwords_trigger();
DROP FUNCTION IF EXISTS public.encrypt_cliente_password(text, uuid);
DROP FUNCTION IF EXISTS public.decrypt_cliente_password(text, uuid);
DROP FUNCTION IF EXISTS public.get_cliente_with_decrypted_passwords(uuid);
DROP FUNCTION IF EXISTS public.migrate_existing_passwords();

-- Remover as funções de criptografia genérica se existirem
DROP FUNCTION IF EXISTS public.encrypt_sensitive_data(text, text);
DROP FUNCTION IF EXISTS public.decrypt_sensitive_data(text, text);
