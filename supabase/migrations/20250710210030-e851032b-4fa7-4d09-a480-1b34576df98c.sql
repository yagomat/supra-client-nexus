-- Reverter as funções criadas na migração anterior
DROP FUNCTION IF EXISTS public.get_clientes_paginated(uuid, integer, integer, boolean, text, text);
DROP FUNCTION IF EXISTS public.get_cliente_sensitive_data(uuid, uuid);
DROP FUNCTION IF EXISTS public.check_search_rate_limit(uuid, integer, integer);
DROP FUNCTION IF EXISTS public.log_sensitive_data_access(uuid, text, uuid, text, text);