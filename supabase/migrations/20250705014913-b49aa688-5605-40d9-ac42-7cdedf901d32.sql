
-- Corrigir a função update_cliente_status para usar a lógica correta com dias ajustados
CREATE OR REPLACE FUNCTION public.update_cliente_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  cliente_record RECORD;
  mes_atual INT;
  ano_atual INT;
  mes_anterior INT;
  ano_anterior INT;
  tem_pagamento_mes_atual BOOLEAN := FALSE;
  tem_pagamento_mes_anterior BOOLEAN := FALSE;
  dia_atual INT;
  dia_vencimento_ajustado INT;
  ultimo_dia_mes_atual INT;
BEGIN
  -- Obter dados do cliente
  SELECT * INTO cliente_record FROM public.clientes WHERE id = NEW.cliente_id;
  
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
  
  -- Ajustar o dia de vencimento para o mês atual
  dia_vencimento_ajustado := LEAST(cliente_record.dia_vencimento, ultimo_dia_mes_atual);
  
  -- Verificar pagamento do mês atual
  SELECT EXISTS (
    SELECT 1 
    FROM public.pagamentos 
    WHERE cliente_id = NEW.cliente_id 
    AND mes = mes_atual 
    AND ano = ano_atual 
    AND status IN ('pago', 'pago_confianca')
  ) INTO tem_pagamento_mes_atual;
  
  -- Verificar pagamento do mês anterior
  SELECT EXISTS (
    SELECT 1 
    FROM public.pagamentos 
    WHERE cliente_id = NEW.cliente_id 
    AND mes = mes_anterior 
    AND ano = ano_anterior 
    AND status IN ('pago', 'pago_confianca')
  ) INTO tem_pagamento_mes_anterior;
  
  -- Aplicar a regra de negócio correta para determinar o status
  IF tem_pagamento_mes_atual THEN
    -- Se pagou o mês atual, status ativo
    UPDATE public.clientes SET status = 'ativo' WHERE id = NEW.cliente_id;
  ELSIF tem_pagamento_mes_anterior AND dia_atual <= dia_vencimento_ajustado THEN
    -- Se pagou o mês anterior e ainda não chegou a data de vencimento ajustada, status ativo
    UPDATE public.clientes SET status = 'ativo' WHERE id = NEW.cliente_id;
  ELSE
    -- Em qualquer outro caso, status inativo
    UPDATE public.clientes SET status = 'inativo' WHERE id = NEW.cliente_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Corrigir a função update_cliente_status_on_vencimento_change para usar a mesma lógica
CREATE OR REPLACE FUNCTION public.update_cliente_status_on_vencimento_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  mes_atual INT;
  ano_atual INT;
  mes_anterior INT;
  ano_anterior INT;
  tem_pagamento_mes_atual BOOLEAN := FALSE;
  tem_pagamento_mes_anterior BOOLEAN := FALSE;
  dia_atual INT;
  dia_vencimento_ajustado INT;
  ultimo_dia_mes_atual INT;
BEGIN
  -- Only proceed if dia_vencimento was actually changed
  IF OLD.dia_vencimento = NEW.dia_vencimento THEN
    RETURN NEW;
  END IF;
  
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
  
  -- Ajustar o dia de vencimento para o mês atual
  dia_vencimento_ajustado := LEAST(NEW.dia_vencimento, ultimo_dia_mes_atual);
  
  -- Verificar pagamento do mês atual
  SELECT EXISTS (
    SELECT 1 
    FROM public.pagamentos 
    WHERE cliente_id = NEW.id 
    AND mes = mes_atual 
    AND ano = ano_atual 
    AND status IN ('pago', 'pago_confianca')
  ) INTO tem_pagamento_mes_atual;
  
  -- Verificar pagamento do mês anterior
  SELECT EXISTS (
    SELECT 1 
    FROM public.pagamentos 
    WHERE cliente_id = NEW.id 
    AND mes = mes_anterior 
    AND ano = ano_anterior 
    AND status IN ('pago', 'pago_confianca')
  ) INTO tem_pagamento_mes_anterior;
  
  -- Aplicar a regra de negócio correta para determinar o status
  IF tem_pagamento_mes_atual THEN
    -- Se pagou o mês atual, status ativo
    NEW.status := 'ativo';
  ELSIF tem_pagamento_mes_anterior AND dia_atual <= dia_vencimento_ajustado THEN
    -- Se pagou o mês anterior e ainda não chegou a data de vencimento ajustada, status ativo
    NEW.status := 'ativo';
  ELSE
    -- Em qualquer outro caso, status inativo
    NEW.status := 'inativo';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Executar recálculo de status para todos os clientes com a nova lógica
SELECT public.recalculate_all_client_status_on_startup();
