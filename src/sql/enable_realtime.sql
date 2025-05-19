
-- Function to enable realtime for clients table
CREATE OR REPLACE FUNCTION public.enable_realtime_for_clients()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set REPLICA IDENTITY to FULL for the clientes table
  ALTER TABLE IF EXISTS public.clientes REPLICA IDENTITY FULL;
  
  -- Add the clientes table to the supabase_realtime publication if not already added
  PERFORM pg_catalog.pg_advisory_lock(42);
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND schemaname = 'public'
    AND tablename = 'clientes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;
  END IF;
  PERFORM pg_catalog.pg_advisory_unlock(42);
END;
$$;
