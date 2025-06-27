
-- Remover a constraint existente se ela existir
ALTER TABLE public.mensagens_whatsapp 
DROP CONSTRAINT IF EXISTS mensagens_whatsapp_tipo_mensagem_check;

-- Adicionar nova constraint que permite tipos padrão e tipos personalizados (custom_*)
ALTER TABLE public.mensagens_whatsapp 
ADD CONSTRAINT mensagens_whatsapp_tipo_mensagem_check 
CHECK (
  tipo_mensagem IN ('a_vencer', 'vence_hoje', 'vencido', 'pago') OR 
  tipo_mensagem LIKE 'custom_%'
);
