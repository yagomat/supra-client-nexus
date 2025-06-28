
-- Alterar o valor padrão do status de clientes para 'inativo'
ALTER TABLE public.clientes 
ALTER COLUMN status SET DEFAULT 'inativo';

-- Criar função para recalcular o status de todos os clientes baseado nos pagamentos
CREATE OR REPLACE FUNCTION public.recalculate_all_client_status_on_startup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  client_record RECORD;
  mes_atual INT;
  ano_atual INT;
  mes_anterior INT;
  ano_anterior INT;
  tem_pagamento_mes_atual BOOLEAN := FALSE;
  tem_pagamento_mes_anterior BOOLEAN := FALSE;
  dia_atual INT;
  dia_vencimento_ajustado INT;
  ultimo_dia_mes_atual INT;
  novo_status TEXT;
BEGIN
  -- Obter informações da data atual
  SELECT EXTRACT(MONTH FROM CURRENT_DATE) INTO mes_atual;
  SELECT EXTRACT(YEAR FROM CURRENT_DATE) INTO ano_atual;
  SELECT EXTRACT(DAY FROM CURRENT_DATE) INTO dia_atual;
  SELECT EXTRACT(DAY FROM (DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH' - INTERVAL '1 DAY')) INTO ultimo_dia_mes_atual;
  
  -- Calcular mês e ano anterior
  IF mes_atual = 1 THEN
    mes_anterior := 12;
    ano_anterior := ano_atual - 1;
  ELSE
    mes_anterior := mes_atual - 1;
    ano_anterior := ano_atual;
  END IF;
  
  -- Para cada cliente, recalcular o status baseado nos pagamentos
  FOR client_record IN SELECT * FROM public.clientes LOOP
    
    -- Ajustar o dia de vencimento para o mês atual
    dia_vencimento_ajustado := LEAST(client_record.dia_vencimento, ultimo_dia_mes_atual);
    
    -- Verificar pagamento do mês atual
    SELECT EXISTS (
      SELECT 1 
      FROM public.pagamentos 
      WHERE cliente_id = client_record.id 
      AND mes = mes_atual 
      AND ano = ano_atual 
      AND status IN ('pago', 'pago_confianca')
    ) INTO tem_pagamento_mes_atual;
    
    -- Verificar pagamento do mês anterior
    SELECT EXISTS (
      SELECT 1 
      FROM public.pagamentos 
      WHERE cliente_id = client_record.id 
      AND mes = mes_anterior 
      AND ano = ano_anterior 
      AND status IN ('pago', 'pago_confianca')
    ) INTO tem_pagamento_mes_anterior;
    
    -- Aplicar a regra de negócio para determinar o status
    IF tem_pagamento_mes_atual THEN
      -- Se pagou o mês atual, status ativo
      novo_status := 'ativo';
    ELSIF tem_pagamento_mes_anterior AND dia_atual <= dia_vencimento_ajustado THEN
      -- Se pagou o mês anterior e é até dia do vencimento ajustado (inclusive), status ativo
      novo_status := 'ativo';
    ELSE
      -- Em qualquer outro caso, status inativo
      novo_status := 'inativo';
    END IF;
    
    -- Atualizar o status do cliente apenas se for diferente do atual
    IF client_record.status != novo_status THEN
      UPDATE public.clientes 
      SET status = novo_status 
      WHERE id = client_record.id;
    END IF;
    
  END LOOP;
END;
$function$;

-- Executar a função para recalcular o status de todos os clientes existentes
SELECT public.recalculate_all_client_status_on_startup();
