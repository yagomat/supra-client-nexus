
-- Criar tabela para rastrear cobranças dos clientes
CREATE TABLE public.cliente_cobrancas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  ultimo_aviso TEXT, -- '3_dias', '1_dia', 'hoje', 'ontem', 'renovado'
  data_ultimo_aviso TIMESTAMP WITH TIME ZONE,
  mes_referencia INTEGER NOT NULL,
  ano_referencia INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(cliente_id, mes_referencia, ano_referencia)
);

-- Habilitar RLS na tabela
ALTER TABLE public.cliente_cobrancas ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias cobranças
CREATE POLICY "Users can view their own cobrancas" 
  ON public.cliente_cobrancas 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Política para permitir que usuários criem suas próprias cobranças
CREATE POLICY "Users can create their own cobrancas" 
  ON public.cliente_cobrancas 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Política para permitir que usuários atualizem suas próprias cobranças
CREATE POLICY "Users can update their own cobrancas" 
  ON public.cliente_cobrancas 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Política para permitir que usuários excluam suas próprias cobranças
CREATE POLICY "Users can delete their own cobrancas" 
  ON public.cliente_cobrancas 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Função para obter a fila de cobrança ordenada
CREATE OR REPLACE FUNCTION public.get_fila_cobranca(p_user_id UUID, p_mes INTEGER, p_ano INTEGER)
RETURNS TABLE(
  cliente_id UUID,
  cliente_nome TEXT,
  cliente_telefone TEXT,
  cliente_servidor TEXT,
  dia_vencimento INTEGER,
  valor_plano NUMERIC,
  status_pagamento TEXT,
  dias_para_vencimento INTEGER,
  ultimo_aviso TEXT,
  data_ultimo_aviso TIMESTAMP WITH TIME ZONE,
  prioridade INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  dia_atual INTEGER;
BEGIN
  -- Obter o dia atual
  SELECT EXTRACT(DAY FROM CURRENT_DATE) INTO dia_atual;
  
  RETURN QUERY
  WITH clientes_cobranca AS (
    SELECT 
      c.id as cliente_id,
      c.nome as cliente_nome,
      c.telefone as cliente_telefone,
      c.servidor as cliente_servidor,
      c.dia_vencimento,
      c.valor_plano,
      COALESCE(p.status, 'nao_pago') as status_pagamento,
      -- Calcular dias para vencimento (considerando mês atual)
      CASE 
        WHEN c.dia_vencimento >= dia_atual THEN c.dia_vencimento - dia_atual
        ELSE (EXTRACT(DAY FROM (DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH' - INTERVAL '1 DAY'))::INTEGER - dia_atual) + c.dia_vencimento
      END as dias_para_vencimento,
      co.ultimo_aviso,
      co.data_ultimo_aviso,
      -- Definir prioridade baseada nos dias para vencimento e status de pagamento
      CASE 
        WHEN COALESCE(p.status, 'nao_pago') IN ('pago', 'pago_confianca') THEN 1000 -- Pagos vão para o final
        WHEN c.dia_vencimento < dia_atual THEN -10 -- Vencidos têm prioridade máxima
        WHEN c.dia_vencimento = dia_atual THEN -5 -- Vence hoje
        WHEN c.dia_vencimento - dia_atual <= 1 THEN -3 -- Vence amanhã
        WHEN c.dia_vencimento - dia_atual <= 3 THEN -1 -- Vence em até 3 dias
        ELSE c.dia_vencimento - dia_atual -- Demais casos
      END as prioridade
    FROM public.clientes c
    LEFT JOIN public.pagamentos p ON c.id = p.cliente_id 
      AND p.mes = p_mes 
      AND p.ano = p_ano
    LEFT JOIN public.cliente_cobrancas co ON c.id = co.cliente_id 
      AND co.mes_referencia = p_mes 
      AND co.ano_referencia = p_ano
    WHERE c.user_id = p_user_id
      AND c.status = 'ativo'
  )
  SELECT * FROM clientes_cobranca
  ORDER BY prioridade ASC, cliente_nome ASC;
END;
$$;

-- Função para registrar cobrança
CREATE OR REPLACE FUNCTION public.registrar_cobranca(
  p_cliente_id UUID,
  p_user_id UUID,
  p_tipo_aviso TEXT,
  p_mes INTEGER,
  p_ano INTEGER
) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Inserir ou atualizar registro de cobrança
  INSERT INTO public.cliente_cobrancas (
    cliente_id, user_id, ultimo_aviso, data_ultimo_aviso, mes_referencia, ano_referencia
  ) VALUES (
    p_cliente_id, p_user_id, p_tipo_aviso, NOW(), p_mes, p_ano
  )
  ON CONFLICT (cliente_id, mes_referencia, ano_referencia)
  DO UPDATE SET
    ultimo_aviso = p_tipo_aviso,
    data_ultimo_aviso = NOW(),
    updated_at = NOW();
    
  RETURN json_build_object(
    'success', true,
    'message', 'Cobrança registrada com sucesso'
  );
END;
$$;
