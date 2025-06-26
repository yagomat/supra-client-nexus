
-- Primeiro, remover a função existente
DROP FUNCTION IF EXISTS public.get_fila_cobranca(UUID, INTEGER, INTEGER);

-- Criar a nova função com o tipo de retorno atualizado
CREATE OR REPLACE FUNCTION public.get_fila_cobranca(p_user_id UUID, p_mes INTEGER, p_ano INTEGER)
RETURNS TABLE(
  cliente_id UUID,
  cliente_nome TEXT,
  cliente_telefone TEXT,
  cliente_servidor TEXT,
  dia_vencimento INTEGER,
  valor_plano NUMERIC,
  status_pagamento TEXT,
  data_proximo_pagamento DATE,
  dias_para_vencimento INTEGER,
  ultimo_aviso TEXT,
  data_ultimo_aviso TIMESTAMP WITH TIME ZONE,
  prioridade INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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
      c.id as cliente_id,
      c.nome as cliente_nome,
      c.telefone as cliente_telefone,
      c.servidor as cliente_servidor,
      c.dia_vencimento,
      c.valor_plano,
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
      END as data_proximo_pagamento,
      co.ultimo_aviso,
      co.data_ultimo_aviso
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
      *,
      -- Calcular dias para vencimento baseado na data do próximo pagamento
      (data_proximo_pagamento - data_atual) as dias_para_vencimento,
      -- Prioridade baseada apenas na proximidade da data de pagamento
      -- Quanto mais próximo (ou atrasado), maior a prioridade (menor número)
      (data_proximo_pagamento - data_atual) as prioridade
    FROM clientes_com_pagamento_atual
  )
  SELECT 
    cc.cliente_id,
    cc.cliente_nome,
    cc.cliente_telefone,
    cc.cliente_servidor,
    cc.dia_vencimento,
    cc.valor_plano,
    cc.status_pagamento_atual as status_pagamento,
    cc.data_proximo_pagamento,
    cc.dias_para_vencimento,
    cc.ultimo_aviso,
    cc.data_ultimo_aviso,
    cc.prioridade
  FROM clientes_com_calculo cc
  ORDER BY cc.prioridade ASC, cc.cliente_nome ASC;
END;
$$;
