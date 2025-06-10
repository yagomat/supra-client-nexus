
-- Remove todas as tabelas relacionadas ao WhatsApp
DROP TABLE IF EXISTS public.whatsapp_scheduled_messages CASCADE;
DROP TABLE IF EXISTS public.whatsapp_message_logs CASCADE;
DROP TABLE IF EXISTS public.whatsapp_bulk_campaigns CASCADE;
DROP TABLE IF EXISTS public.whatsapp_billing_settings CASCADE;
DROP TABLE IF EXISTS public.whatsapp_auto_responses CASCADE;
DROP TABLE IF EXISTS public.whatsapp_message_templates CASCADE;
DROP TABLE IF EXISTS public.whatsapp_commands CASCADE;
DROP TABLE IF EXISTS public.whatsapp_sessions CASCADE;

-- Remove a função de processamento de comandos WhatsApp
DROP FUNCTION IF EXISTS public.process_whatsapp_command(uuid, text, text) CASCADE;
