
-- Drop all triggers that depend on the functions first
DROP TRIGGER IF EXISTS trigger_update_licenca_status ON public.clientes;
DROP TRIGGER IF EXISTS trigger_insert_licenca_status ON public.clientes;

-- Now drop the functions
DROP FUNCTION IF EXISTS public.update_licenca_status() CASCADE;
DROP FUNCTION IF EXISTS public.calculate_licenca_status(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.recalculate_all_licenca_status() CASCADE;
DROP FUNCTION IF EXISTS public.check_licenca_status(date) CASCADE;
DROP FUNCTION IF EXISTS public.check_cliente_licencas(uuid) CASCADE;

-- Remove the licenca_status column from clientes table
ALTER TABLE public.clientes DROP COLUMN IF EXISTS licenca_status;
