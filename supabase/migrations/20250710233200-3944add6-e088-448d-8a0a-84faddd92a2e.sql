-- Atualizar a coluna usuario_aplicativo para permitir NULL
ALTER TABLE public.clientes ALTER COLUMN usuario_aplicativo DROP NOT NULL;

-- Atualizar a coluna senha_aplicativo para permitir NULL  
ALTER TABLE public.clientes ALTER COLUMN senha_aplicativo DROP NOT NULL;