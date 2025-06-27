
-- Remove a constraint existente completamente
ALTER TABLE public.mensagens_whatsapp 
DROP CONSTRAINT IF EXISTS mensagens_whatsapp_tipo_mensagem_check;

-- Cria uma nova constraint muito mais permissiva
ALTER TABLE public.mensagens_whatsapp 
ADD CONSTRAINT mensagens_whatsapp_tipo_mensagem_check 
CHECK (LENGTH(tipo_mensagem) > 0);

-- Adiciona comentário para documentar
COMMENT ON CONSTRAINT mensagens_whatsapp_tipo_mensagem_check ON public.mensagens_whatsapp 
IS 'Permite qualquer tipo de mensagem desde que não seja vazio';

-- Log para verificar se foi aplicada
DO $$
BEGIN
    RAISE NOTICE 'Constraint atualizada com sucesso. Agora permite tipos personalizados.';
END $$;
