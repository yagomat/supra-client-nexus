-- Atualizar templates de mensagens WhatsApp com as novas versões
UPDATE public.mensagens_whatsapp 
SET mensagem = 'Oi {primeiro_nome}.
Estou passando para lembrar que o seu plano vence em {dias_vencimento} dias (dia {data_vencimento}).

Para renovar, basta fazer o pagamento da mensalidade no valor de R$ {valor_plano}.

Por favor, envie o comprovante após o pagamento.

Qualquer dúvida, estou à disposição! 😊'
WHERE tipo_mensagem = 'a_vencer';

UPDATE public.mensagens_whatsapp 
SET mensagem = 'Oi {primeiro_nome}.
Estou passando para lembrar que o seu plano vence Hoje (dia {data_vencimento}).

Para renovar, basta fazer o pagamento da mensalidade no valor de R$ {valor_plano}.

Por favor, envie o comprovante após o pagamento.

Qualquer dúvida, estou à disposição! 😊'
WHERE tipo_mensagem = 'vence_hoje';

UPDATE public.mensagens_whatsapp 
SET mensagem = 'Oi {primeiro_nome}.
Estou passando para lembrar que o seu plano venceu a {dias_vencimento} dias (dia {data_vencimento}).

Para renovar, basta fazer o pagamento da mensalidade no valor de R$ {valor_plano}.

Por favor, envie o comprovante após o pagamento.

Qualquer dúvida, estou à disposição! 😊'
WHERE tipo_mensagem = 'vencido';