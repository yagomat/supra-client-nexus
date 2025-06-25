
-- Atualizar a função para usar LEFT JOIN e mostrar todos os clientes
CREATE OR REPLACE FUNCTION public.filter_pagamentos_with_clients(
  p_cliente_id uuid DEFAULT NULL::uuid, 
  p_mes integer DEFAULT NULL::integer, 
  p_ano integer DEFAULT NULL::integer, 
  p_status text DEFAULT NULL::text, 
  p_user_id uuid DEFAULT NULL::uuid, 
  p_ordem text DEFAULT 'data'::text
)
RETURNS TABLE(
  id uuid,
  cliente_id uuid,
  mes integer,
  ano integer,
  status text,
  data_pagamento timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  cliente_nome text,
  cliente_created_at timestamp with time zone,
  cliente_dia_vencimento integer,
  cliente_valor_plano numeric,
  cliente_status text,
  cliente_telefone text,
  cliente_uf text,
  cliente_servidor text,
  cliente_dispositivo_smart text,
  cliente_aplicativo text,
  cliente_usuario_aplicativo text,
  cliente_senha_aplicativo text,
  cliente_data_licenca_aplicativo date,
  cliente_possui_tela_adicional boolean,
  cliente_dispositivo_smart_2 text,
  cliente_aplicativo_2 text,
  cliente_usuario_2 text,
  cliente_senha_2 text,
  cliente_data_licenca_2 date,
  cliente_observacoes text,
  cliente_user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  query text;
BEGIN
  -- Query base usando LEFT JOIN para incluir todos os clientes
  -- Quando não há filtro de mês/ano específico, mostra todos os clientes
  IF p_mes IS NULL AND p_ano IS NULL THEN
    query := 'SELECT 
      NULL::uuid as id,
      c.id as cliente_id,
      NULL::integer as mes,
      NULL::integer as ano,
      ''nao_pago''::text as status,
      NULL::timestamp with time zone as data_pagamento,
      c.created_at as created_at,
      NULL::timestamp with time zone as updated_at,
      c.nome as cliente_nome,
      c.created_at as cliente_created_at,
      c.dia_vencimento as cliente_dia_vencimento,
      c.valor_plano as cliente_valor_plano,
      c.status as cliente_status,
      c.telefone as cliente_telefone,
      c.uf as cliente_uf,
      c.servidor as cliente_servidor,
      c.dispositivo_smart as cliente_dispositivo_smart,
      c.aplicativo as cliente_aplicativo,
      c.usuario_aplicativo as cliente_usuario_aplicativo,
      c.senha_aplicativo as cliente_senha_aplicativo,
      c.data_licenca_aplicativo as cliente_data_licenca_aplicativo,
      c.possui_tela_adicional as cliente_possui_tela_adicional,
      c.dispositivo_smart_2 as cliente_dispositivo_smart_2,
      c.aplicativo_2 as cliente_aplicativo_2,
      c.usuario_2 as cliente_usuario_2,
      c.senha_2 as cliente_senha_2,
      c.data_licenca_2 as cliente_data_licenca_2,
      c.observacoes as cliente_observacoes,
      c.user_id as cliente_user_id
      FROM public.clientes c 
      WHERE 1=1';
  ELSE
    -- Query para mês/ano específico usando LEFT JOIN
    query := 'SELECT 
      p.id,
      c.id as cliente_id,
      COALESCE(p.mes, ' || COALESCE(p_mes, EXTRACT(MONTH FROM CURRENT_DATE))::text || ') as mes,
      COALESCE(p.ano, ' || COALESCE(p_ano, EXTRACT(YEAR FROM CURRENT_DATE))::text || ') as ano,
      COALESCE(p.status, ''nao_pago'') as status,
      p.data_pagamento,
      COALESCE(p.created_at, c.created_at) as created_at,
      p.updated_at,
      c.nome as cliente_nome,
      c.created_at as cliente_created_at,
      c.dia_vencimento as cliente_dia_vencimento,
      c.valor_plano as cliente_valor_plano,
      c.status as cliente_status,
      c.telefone as cliente_telefone,
      c.uf as cliente_uf,
      c.servidor as cliente_servidor,
      c.dispositivo_smart as cliente_dispositivo_smart,
      c.aplicativo as cliente_aplicativo,
      c.usuario_aplicativo as cliente_usuario_aplicativo,
      c.senha_aplicativo as cliente_senha_aplicativo,
      c.data_licenca_aplicativo as cliente_data_licenca_aplicativo,
      c.possui_tela_adicional as cliente_possui_tela_adicional,
      c.dispositivo_smart_2 as cliente_dispositivo_smart_2,
      c.aplicativo_2 as cliente_aplicativo_2,
      c.usuario_2 as cliente_usuario_2,
      c.senha_2 as cliente_senha_2,
      c.data_licenca_2 as cliente_data_licenca_2,
      c.observacoes as cliente_observacoes,
      c.user_id as cliente_user_id
      FROM public.clientes c 
      LEFT JOIN public.pagamentos p ON c.id = p.cliente_id';
      
    -- Adicionar condições do LEFT JOIN
    IF p_mes IS NOT NULL THEN
      query := query || ' AND p.mes = ' || p_mes;
    END IF;
    
    IF p_ano IS NOT NULL THEN
      query := query || ' AND p.ano = ' || p_ano;
    END IF;
    
    query := query || ' WHERE 1=1';
  END IF;
            
  -- Adicionar condição para o user_id quando fornecido
  IF p_user_id IS NOT NULL THEN
    query := query || ' AND c.user_id = ' || quote_literal(p_user_id);
  END IF;
  
  -- Adicionar condição para cliente_id quando fornecido
  IF p_cliente_id IS NOT NULL THEN
    query := query || ' AND c.id = ' || quote_literal(p_cliente_id);
  END IF;
  
  -- Adicionar condição para o status quando fornecido
  IF p_status IS NOT NULL THEN
    IF p_mes IS NULL AND p_ano IS NULL THEN
      -- Para query sem mês/ano, filtrar por status sempre como nao_pago
      IF p_status != 'nao_pago' THEN
        query := query || ' AND FALSE'; -- Não retorna nada se pedir status diferente de nao_pago
      END IF;
    ELSE
      query := query || ' AND COALESCE(p.status, ''nao_pago'') = ' || quote_literal(p_status);
    END IF;
  END IF;
  
  -- Adicionar ordenação baseada no parâmetro
  IF p_ordem = 'nome' THEN
    query := query || ' ORDER BY c.nome ASC';
  ELSIF p_ordem = 'data' THEN
    -- Ordenar por data de cadastro do cliente (mais recente primeiro)
    query := query || ' ORDER BY c.created_at DESC';
  ELSE 
    -- Default: ordenar por ano e mês dos pagamentos, depois por nome
    query := query || ' ORDER BY COALESCE(p.ano, ' || COALESCE(p_ano, EXTRACT(YEAR FROM CURRENT_DATE))::text || ') DESC, COALESCE(p.mes, ' || COALESCE(p_mes, EXTRACT(MONTH FROM CURRENT_DATE))::text || ') DESC, c.nome ASC';
  END IF;
  
  -- Executar a consulta dinamicamente e retornar os resultados
  RETURN QUERY EXECUTE query;
END;
$function$
