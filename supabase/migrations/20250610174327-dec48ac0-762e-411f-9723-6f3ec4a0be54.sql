
-- Create a new trigger function that handles client status updates when dia_vencimento changes
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
  ELSIF tem_pagamento_mes_anterior AND dia_atual <= NEW.dia_vencimento THEN
    -- If paid previous month and current day is <= due date (inclusive), status is active
    NEW.status := 'ativo';
  ELSE
    -- In any other case, status is inactive
    NEW.status := 'inativo';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger that will be fired when dia_vencimento changes
DROP TRIGGER IF EXISTS trigger_update_cliente_status_on_vencimento_change ON public.clientes;

CREATE TRIGGER trigger_update_cliente_status_on_vencimento_change
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_cliente_status_on_vencimento_change();
