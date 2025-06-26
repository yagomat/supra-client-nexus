
-- Primeiro, remover a função existente
DROP FUNCTION IF EXISTS public.get_fila_cobranca(uuid, integer, integer);

-- Agora criar a nova versão com o cliente_status incluído
CREATE OR REPLACE FUNCTION public.get_fila_cobranca(p_user_id uuid, p_mes integer, p_ano integer)
 RETURNS TABLE(
   cliente_id uuid, 
   cliente_nome text, 
   cliente_telefone text, 
   cliente_servidor text, 
   cliente_status text,  -- Adicionado o status do cliente
   dia_vencimento integer, 
   valor_plano numeric, 
   status_pagamento text, 
   data_proximo_pagamento date, 
   dias_para_vencimento integer, 
   ultimo_aviso text, 
   data_ultimo_aviso timestamp with time zone, 
   prioridade integer
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  data_atual DATE;
  mes_atual INTEGER;
  ano_atual INTEGER;
BEGIN
  -- Obter data, mês e ano atuais
  SELECT CURRENT_DATE INTO data_atual;
  SELECT EXTRACT(MONTH FROM data_atual) INTO mes_atual;
  SELECT EXTRACT(YEAR FROM data_atual) INTO ano_atual;
  
  RETURN QUERY
  WITH clientes_com_pagamento_atual AS (
    SELECT 
      c.id as c_cliente_id,
      c.nome as c_cliente_nome,
      c.telefone as c_cliente_telefone,
      c.servidor as c_cliente_servidor,
      c.status as c_cliente_status,  -- Adicionado o status do cliente
      c.dia_vencimento as c_dia_vencimento,
      c.valor_plano as c_valor_plano,
      COALESCE(p_atual.status, 'nao_pago') as status_pagamento_atual,
      -- Calcular a data do próximo pagamento
      CASE 
        -- Se já pagou o mês atual, próximo pagamento é no mês seguinte
        WHEN COALESCE(p_atual.status, 'nao_pago') IN ('pago', 'pago_confianca') THEN
          CASE 
            WHEN mes_atual = 12 THEN 
              make_date(ano_atual + 1, 1, LEAST(c.dia_vencimento, EXTRACT(DAY FROM (DATE_TRUNC('MONTH', make_date(ano_atual + 1, 2, 1)) - INTERVAL '1 DAY'))::INTEGER))
            ELSE 
              make_date(ano_atual, mes_atual + 1, LEAST(c.dia_vencimento, EXTRACT(DAY FROM (DATE_TRUNC('MONTH', make_date(ano_atual, mes_atual + 2, 1)) - INTERVAL '1 DAY'))::INTEGER))
          END
        -- Se não pagou ainda
        ELSE
          CASE 
            -- Se o dia do vencimento já passou este mês, próximo pagamento é neste mês (em atraso)
            WHEN c.dia_vencimento < EXTRACT(DAY FROM data_atual) THEN
              make_date(ano_atual, mes_atual, c.dia_vencimento)
            -- Se o dia do vencimento ainda não chegou ou é hoje, próximo pagamento é neste mês
            ELSE 
              make_date(ano_atual, mes_atual, LEAST(c.dia_vencimento, EXTRACT(DAY FROM (DATE_TRUNC('MONTH', data_atual) + INTERVAL '1 MONTH' - INTERVAL '1 DAY'))::INTEGER))
          END
      END as calc_data_proximo_pagamento,
      co.ultimo_aviso as co_ultimo_aviso,
      co.data_ultimo_aviso as co_data_ultimo_aviso
    FROM public.clientes c
    LEFT JOIN public.pagamentos p_atual ON c.id = p_atual.cliente_id 
      AND p_atual.mes = mes_atual 
      AND p_atual.ano = ano_atual
    LEFT JOIN public.cliente_cobrancas co ON c.id = co.cliente_id 
      AND co.mes_referencia = mes_atual 
      AND co.ano_referencia = ano_atual
    WHERE c.user_id = p_user_id
  ),
  clientes_com_calculo AS (
    SELECT 
      c_cliente_id,
      c_cliente_nome,
      c_cliente_telefone,
      c_cliente_servidor,
      c_cliente_status,  -- Incluído o status do cliente
      c_dia_vencimento,
      c_valor_plano,
      status_pagamento_atual,
      calc_data_proximo_pagamento as data_proximo_pagamento_final,
      co_ultimo_aviso,
      co_data_ultimo_aviso,
      -- Calcular dias para vencimento baseado na data do próximo pagamento
      (calc_data_proximo_pagamento - data_atual) as dias_para_vencimento_calc,
      -- Prioridade baseada apenas na proximidade da data de pagamento
      -- Quanto mais próximo (ou atrasado), maior a prioridade (menor número)
      (calc_data_proximo_pagamento - data_atual) as prioridade_calc
    FROM clientes_com_pagamento_atual
  )
  SELECT 
    cc.c_cliente_id as cliente_id,
    cc.c_cliente_nome as cliente_nome,
    cc.c_cliente_telefone as cliente_telefone,
    cc.c_cliente_servidor as cliente_servidor,
    cc.c_cliente_status as cliente_status,  -- Retornado o status do cliente
    cc.c_dia_vencimento as dia_vencimento,
    cc.c_valor_plano as valor_plano,
    cc.status_pagamento_atual as status_pagamento,
    cc.data_proximo_pagamento_final as data_proximo_pagamento,
    cc.dias_para_vencimento_calc as dias_para_vencimento,
    cc.co_ultimo_aviso as ultimo_aviso,
    cc.co_data_ultimo_aviso as data_ultimo_aviso,
    cc.prioridade_calc as prioridade
  FROM clientes_com_calculo cc
  ORDER BY cc.prioridade_calc ASC, cc.c_cliente_nome ASC;
END;
$function$
