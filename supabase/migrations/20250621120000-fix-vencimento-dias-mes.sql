
-- Corrigir a lógica de cálculo de status do cliente considerando dias do mês
-- Substituir as funções existentes com lógica corrigida

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
  
  -- Obter mês e ano atuais
  SELECT EXTRACT(MONTH FROM CURRENT_DATE) INTO mes_atual;
  SELECT EXTRACT(YEAR FROM CURRENT_DATE) INTO ano_atual;
  
  -- Calcular mês e ano anterior
  IF mes_atual = 1 THEN
    mes_anterior := 12;
    ano_anterior := ano_atual - 1;
  ELSE
    mes_anterior := mes_atual - 1;
    ano_anterior := ano_atual;
  END IF;
  
  -- Obter o dia atual
  SELECT EXTRACT(DAY FROM CURRENT_DATE) INTO dia_atual;
  
  -- Calcular o último dia do mês atual
  SELECT EXTRACT(DAY FROM (DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH' - INTERVAL '1 DAY')) INTO ultimo_dia_mes_atual;
  
  -- Ajustar o dia de vencimento para o mês atual
  -- Se o dia de vencimento é maior que o último dia do mês, usar o último dia do mês
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
  
  -- Aplicar a regra de negócio para determinar o status
  IF tem_pagamento_mes_atual THEN
    -- Se pagou o mês atual, status ativo
    UPDATE public.clientes SET status = 'ativo' WHERE id = NEW.cliente_id;
  ELSIF tem_pagamento_mes_anterior AND dia_atual <= dia_vencimento_ajustado THEN
    -- Se pagou o mês anterior e é até dia do vencimento ajustado (inclusive), status ativo
    UPDATE public.clientes SET status = 'ativo' WHERE id = NEW.cliente_id;
  ELSE
    -- Em qualquer outro caso, status inativo
    UPDATE public.clientes SET status = 'inativo' WHERE id = NEW.cliente_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

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
  
  -- Get current month and year
  SELECT EXTRACT(MONTH FROM CURRENT_DATE) INTO mes_atual;
  SELECT EXTRACT(YEAR FROM CURRENT_DATE) INTO ano_atual;
  
  -- Calculate previous month and year
  IF mes_atual = 1 THEN
    mes_anterior := 12;
    ano_anterior := ano_atual - 1;
  ELSE
    mes_anterior := mes_atual - 1;
    ano_anterior := ano_atual;
  END IF;
  
  -- Get current day
  SELECT EXTRACT(DAY FROM CURRENT_DATE) INTO dia_atual;
  
  -- Calculate the last day of current month
  SELECT EXTRACT(DAY FROM (DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH' - INTERVAL '1 DAY')) INTO ultimo_dia_mes_atual;
  
  -- Adjust due date for current month
  -- If due date is greater than last day of month, use last day of month
  dia_vencimento_ajustado := LEAST(NEW.dia_vencimento, ultimo_dia_mes_atual);
  
  -- Check payment for current month
  SELECT EXISTS (
    SELECT 1 
    FROM public.pagamentos 
    WHERE cliente_id = NEW.id 
    AND mes = mes_atual 
    AND ano = ano_atual 
    AND status IN ('pago', 'pago_confianca')
  ) INTO tem_pagamento_mes_atual;
  
  -- Check payment for previous month
  SELECT EXISTS (
    SELECT 1 
    FROM public.pagamentos 
    WHERE cliente_id = NEW.id 
    AND mes = mes_anterior 
    AND ano = ano_anterior 
    AND status IN ('pago', 'pago_confianca')
  ) INTO tem_pagamento_mes_anterior;
  
  -- Apply business logic to determine status
  IF tem_pagamento_mes_atual THEN
    -- If paid current month, status is active
    NEW.status := 'ativo';
  ELSIF tem_pagamento_mes_anterior AND dia_atual <= dia_vencimento_ajustado THEN
    -- If paid previous month and current day is <= adjusted due date (inclusive), status is active
    NEW.status := 'ativo';
  ELSE
    -- In any other case, status is inactive
    NEW.status := 'inativo';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recriar os triggers para garantir que estão usando as funções atualizadas
DROP TRIGGER IF EXISTS trigger_update_cliente_status ON public.pagamentos;
DROP TRIGGER IF EXISTS trigger_update_cliente_status_on_vencimento_change ON public.clientes;

CREATE TRIGGER trigger_update_cliente_status
  AFTER INSERT OR UPDATE ON public.pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cliente_status();

CREATE TRIGGER trigger_update_cliente_status_on_vencimento_change
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cliente_status_on_vencimento_change();
