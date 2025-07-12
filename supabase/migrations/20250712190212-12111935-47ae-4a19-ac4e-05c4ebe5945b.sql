
-- Limpar senhas criptografadas existentes dos clientes
-- Definir como NULL as senhas que aparentam estar criptografadas (muito longas)
UPDATE public.clientes 
SET 
  senha_aplicativo = NULL,
  senha_2 = NULL
WHERE 
  LENGTH(senha_aplicativo) > 100 OR 
  LENGTH(senha_2) > 100 OR
  senha_aplicativo LIKE 'Pkzyv%' OR
  senha_2 LIKE 'Pkzyv%';
