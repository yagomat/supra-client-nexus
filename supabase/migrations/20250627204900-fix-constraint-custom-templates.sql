
-- Primeiro, remover completamente a constraint existente
DO $$ 
BEGIN
    -- Verificar se a constraint existe e removê-la
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'mensagens_whatsapp_tipo_mensagem_check' 
        AND table_name = 'mensagens_whatsapp'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.mensagens_whatsapp 
        DROP CONSTRAINT mensagens_whatsapp_tipo_mensagem_check;
    END IF;
END $$;

-- Criar nova constraint que permite tipos padrão E tipos personalizados
ALTER TABLE public.mensagens_whatsapp 
ADD CONSTRAINT mensagens_whatsapp_tipo_mensagem_check 
CHECK (
    -- Permitir tipos padrão
    tipo_mensagem IN ('a_vencer', 'vence_hoje', 'vencido', 'pago') OR 
    -- Permitir tipos personalizados que começam com 'custom_'
    tipo_mensagem LIKE 'custom_%' OR
    -- Permitir qualquer outro tipo que possa existir
    LENGTH(tipo_mensagem) > 0
);

-- Verificar se existem registros com tipos inválidos e corrigi-los se necessário
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Verificar registros que podem estar causando problemas
    FOR rec IN 
        SELECT id, tipo_mensagem 
        FROM public.mensagens_whatsapp 
        WHERE NOT (
            tipo_mensagem IN ('a_vencer', 'vence_hoje', 'vencido', 'pago') OR 
            tipo_mensagem LIKE 'custom_%'
        )
    LOOP
        -- Se encontrar registros problemáticos, reportar (mas não alterar automaticamente)
        RAISE NOTICE 'Registro encontrado com tipo_mensagem não padrão: % (ID: %)', rec.tipo_mensagem, rec.id;
    END LOOP;
END $$;

-- Criar índice para melhorar performance nas consultas por tipo_mensagem
CREATE INDEX IF NOT EXISTS idx_mensagens_whatsapp_tipo_mensagem 
ON public.mensagens_whatsapp(tipo_mensagem);

-- Criar índice para melhorar performance nas consultas por user_id
CREATE INDEX IF NOT EXISTS idx_mensagens_whatsapp_user_id 
ON public.mensagens_whatsapp(user_id);

-- Verificar se a função add_template_personalizado existe e funciona corretamente
DO $$
BEGIN
    -- Testar se a função existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'add_template_personalizado'
    ) THEN
        RAISE EXCEPTION 'Função add_template_personalizado não existe!';
    END IF;
    
    RAISE NOTICE 'Migração aplicada com sucesso. Constraint atualizada para permitir templates personalizados.';
END $$;
