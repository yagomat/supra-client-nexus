
-- Remover funções não utilizadas para templates personalizados
DROP FUNCTION IF EXISTS public.add_template_personalizado(uuid, text, text);
DROP FUNCTION IF EXISTS public.delete_template_personalizado(uuid, uuid);

-- Remover função que não é mais necessária
DROP FUNCTION IF EXISTS public.get_templates_mensagens_whatsapp(uuid);

-- Simplificar a constraint da tabela mensagens_whatsapp para permitir apenas tipos padrão
ALTER TABLE public.mensagens_whatsapp 
DROP CONSTRAINT IF EXISTS mensagens_whatsapp_tipo_mensagem_check;

-- Adicionar constraint mais restritiva para permitir apenas tipos padrão
ALTER TABLE public.mensagens_whatsapp 
ADD CONSTRAINT mensagens_whatsapp_tipo_mensagem_check 
CHECK (tipo_mensagem IN ('a_vencer', 'vence_hoje', 'vencido', 'pago'));

-- Remover registros de templates personalizados existentes (se houver)
DELETE FROM public.mensagens_whatsapp 
WHERE is_template_padrao = FALSE OR tipo_mensagem LIKE 'custom_%';

-- Adicionar comentário para documentar a mudança
COMMENT ON CONSTRAINT mensagens_whatsapp_tipo_mensagem_check ON public.mensagens_whatsapp 
IS 'Permite apenas os 4 tipos de mensagem padrão do sistema';
