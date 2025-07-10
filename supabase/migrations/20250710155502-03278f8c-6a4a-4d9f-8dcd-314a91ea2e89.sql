-- Atualizar mensagens pré-definidas dos templates WhatsApp
UPDATE public.mensagens_whatsapp 
SET mensagem = 'Oi {primeiro_nome}.
Estou passando para lembrar que o seu plano vence em {dias_vencimento} (dia {data_vencimento})

Para renovar, basta fazer o pagamento da mensalidade no valor de R$ {valor_plano}.

Por favor, envie o comprovante após o pagamento.

Qualquer dúvida, estou à disposição! 😊'
WHERE tipo_mensagem = 'a_vencer' AND is_template_padrao = true;

UPDATE public.mensagens_whatsapp 
SET mensagem = 'Oi {primeiro_nome}.
Estou passando para lembrar que o seu plano vence Hoje (dia {data_vencimento})

Para renovar, basta fazer o pagamento da mensalidade no valor de R$ {valor_plano}.

Por favor, envie o comprovante após o pagamento.

Qualquer dúvida, estou à disposição! 😊'
WHERE tipo_mensagem = 'vence_hoje' AND is_template_padrao = true;

UPDATE public.mensagens_whatsapp 
SET mensagem = 'Oi {primeiro_nome}.
Estou passando para lembrar que o seu plano venceu a {dias_vencimento} (dia {data_vencimento})

Para renovar, basta fazer o pagamento da mensalidade no valor de R$ {valor_plano}.

Por favor, envie o comprovante após o pagamento.

Qualquer dúvida, estou à disposição! 😊'
WHERE tipo_mensagem = 'vencido' AND is_template_padrao = true;

-- Caso não existam registros ainda, inserir os templates padrão para cada usuário
INSERT INTO public.mensagens_whatsapp (user_id, tipo_mensagem, mensagem, is_template_padrao)
SELECT 
  auth_users.id,
  'a_vencer',
  'Oi {primeiro_nome}.
Estou passando para lembrar que o seu plano vence em {dias_vencimento} (dia {data_vencimento})

Para renovar, basta fazer o pagamento da mensalidade no valor de R$ {valor_plano}.

Por favor, envie o comprovante após o pagamento.

Qualquer dúvida, estou à disposição! 😊',
  true
FROM auth.users auth_users
WHERE NOT EXISTS (
  SELECT 1 FROM public.mensagens_whatsapp 
  WHERE user_id = auth_users.id AND tipo_mensagem = 'a_vencer'
);

INSERT INTO public.mensagens_whatsapp (user_id, tipo_mensagem, mensagem, is_template_padrao)
SELECT 
  auth_users.id,
  'vence_hoje',
  'Oi {primeiro_nome}.
Estou passando para lembrar que o seu plano vence Hoje (dia {data_vencimento})

Para renovar, basta fazer o pagamento da mensalidade no valor de R$ {valor_plano}.

Por favor, envie o comprovante após o pagamento.

Qualquer dúvida, estou à disposição! 😊',
  true
FROM auth.users auth_users
WHERE NOT EXISTS (
  SELECT 1 FROM public.mensagens_whatsapp 
  WHERE user_id = auth_users.id AND tipo_mensagem = 'vence_hoje'
);

INSERT INTO public.mensagens_whatsapp (user_id, tipo_mensagem, mensagem, is_template_padrao)
SELECT 
  auth_users.id,
  'vencido',
  'Oi {primeiro_nome}.
Estou passando para lembrar que o seu plano venceu a {dias_vencimento} (dia {data_vencimento})

Para renovar, basta fazer o pagamento da mensalidade no valor de R$ {valor_plano}.

Por favor, envie o comprovante após o pagamento.

Qualquer dúvida, estou à disposição! 😊',
  true
FROM auth.users auth_users
WHERE NOT EXISTS (
  SELECT 1 FROM public.mensagens_whatsapp 
  WHERE user_id = auth_users.id AND tipo_mensagem = 'vencido'
);

-- Inserir template padrão para "pago" se não existir
INSERT INTO public.mensagens_whatsapp (user_id, tipo_mensagem, mensagem, is_template_padrao)
SELECT 
  auth_users.id,
  'pago',
  'Oi {primeiro_nome}! 😊

Recebi seu pagamento de R$ {valor_plano}. Seu plano foi renovado com sucesso!

Obrigado pela confiança e pontualidade.

Qualquer dúvida, estou à disposição!',
  true
FROM auth.users auth_users
WHERE NOT EXISTS (
  SELECT 1 FROM public.mensagens_whatsapp 
  WHERE user_id = auth_users.id AND tipo_mensagem = 'pago'
);