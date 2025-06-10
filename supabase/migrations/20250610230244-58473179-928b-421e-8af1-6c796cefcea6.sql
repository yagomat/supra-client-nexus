
-- Atualizar a função filter_pagamentos para incluir ordenação por data de cadastro
CREATE OR REPLACE FUNCTION public.filter_pagamentos(
  p_cliente_id uuid DEFAULT NULL::uuid, 
  p_mes integer DEFAULT NULL::integer, 
  p_ano integer DEFAULT NULL::integer, 
  p_status text DEFAULT NULL::text, 
  p_user_id uuid DEFAULT NULL::uuid, 
  p_ordem text DEFAULT 'data'::text
)
RETURNS SETOF pagamentos
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  query text;
BEGIN
  -- Iniciar com a consulta base
  query := 'SELECT p.* FROM public.pagamentos p 
            INNER JOIN public.clientes c ON p.cliente_id = c.id 
            WHERE 1=1';
            
  -- Adicionar condição para o user_id quando fornecido
  IF p_user_id IS NOT NULL THEN
    query := query || ' AND c.user_id = ' || quote_literal(p_user_id);
  END IF;
  
  -- Adicionar condição para cliente_id quando fornecido
  IF p_cliente_id IS NOT NULL THEN
    query := query || ' AND p.cliente_id = ' || quote_literal(p_cliente_id);
  END IF;
  
  -- Adicionar condição para o mês quando fornecido
  IF p_mes IS NOT NULL THEN
    query := query || ' AND p.mes = ' || p_mes;
  END IF;
  
  -- Adicionar condição para o ano quando fornecido
  IF p_ano IS NOT NULL THEN
    query := query || ' AND p.ano = ' || p_ano;
  END IF;
  
  -- Adicionar condição para o status quando fornecido
  IF p_status IS NOT NULL THEN
    query := query || ' AND p.status = ' || quote_literal(p_status);
  END IF;
  
  -- Adicionar ordenação baseada no parâmetro
  IF p_ordem = 'nome' THEN
    query := query || ' ORDER BY c.nome ASC';
  ELSIF p_ordem = 'data' THEN
    -- Ordenar por data de cadastro do cliente (mais recente primeiro)
    query := query || ' ORDER BY c.created_at DESC';
  ELSE 
    -- Default: ordenar por ano e mês dos pagamentos
    query := query || ' ORDER BY p.ano DESC, p.mes DESC';
  END IF;
  
  -- Executar a consulta dinamicamente e retornar os resultados
  RETURN QUERY EXECUTE query;
END;
$function$
