
import { FilaCobranca } from "@/services/cobrancaService";
import { Cliente, Pagamento } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { calculatePaymentStatus } from "@/hooks/cliente/paymentCalculationUtils";

export const formatarMensagemWhatsApp = (
  mensagem: string,
  cliente: FilaCobranca
): string => {
  const dataVencimento = format(new Date(cliente.data_proximo_pagamento), "dd/MM/yyyy", {
    locale: ptBR
  });

  const diasVencimento = Math.abs(cliente.dias_para_vencimento);
  const valorPlano = cliente.valor_plano ? cliente.valor_plano.toFixed(2).replace('.', ',') : '0,00';

  return mensagem
    .replace(/{nome}/g, cliente.cliente_nome)
    .replace(/{primeiro_nome}/g, cliente.cliente_nome.split(' ')[0])
    .replace(/{dias_vencimento}/g, diasVencimento.toString())
    .replace(/{data_vencimento}/g, dataVencimento)
    .replace(/{valor_plano}/g, valorPlano);
};

// Nova função para formatar mensagem usando dados do cliente e pagamentos
export const formatarMensagemWhatsAppComCliente = (
  mensagem: string,
  cliente: Cliente,
  allPayments: Pagamento[] = []
): string => {
  // Usar exatamente a mesma lógica do calculatePaymentStatus
  const paymentStatus = calculatePaymentStatus(cliente, allPayments);
  
  let diasVencimento = 0;
  let dataVencimento = '';
  
  // Se temos informação de vencimento, usar a data exata do cálculo
  if (paymentStatus.type !== 'no_info' && paymentStatus.nextDueDate) {
    // Usar a data exata calculada pelo paymentStatus
    dataVencimento = format(paymentStatus.nextDueDate, "dd/MM/yyyy", {
      locale: ptBR
    });
    
    // Usar os dias exatos calculados pelo paymentStatus
    diasVencimento = paymentStatus.days;
  }

  const valorPlano = cliente.valor_plano ? cliente.valor_plano.toFixed(2).replace('.', ',') : '0,00';
  const primeiroNome = cliente.nome.split(' ')[0];

  return mensagem
    .replace(/{nome}/g, cliente.nome)
    .replace(/{primeiro_nome}/g, primeiroNome)
    .replace(/{dias_vencimento}/g, diasVencimento.toString())
    .replace(/{data_vencimento}/g, dataVencimento)
    .replace(/{valor_plano}/g, valorPlano);
};

export const gerarLinkWhatsApp = (
  codigoPais: string,
  telefone: string,
  mensagem: string
): string => {
  // Remover caracteres não numéricos do telefone
  const telefoneNumerico = telefone.replace(/\D/g, '');
  
  // Remover + do código do país se existir
  const codigoPaisNumerico = codigoPais.replace(/\+/g, '');
  
  // Codificar a mensagem para URL
  const mensagemCodificada = encodeURIComponent(mensagem);
  
  return `https://wa.me/${codigoPaisNumerico}${telefoneNumerico}?text=${mensagemCodificada}`;
};

export const determinarTipoMensagem = (diasParaVencimento: number): 'a_vencer' | 'vence_hoje' | 'vencido' | 'pago' => {
  if (diasParaVencimento > 0) {
    return 'a_vencer';
  } else if (diasParaVencimento === 0) {
    return 'vence_hoje';
  } else {
    return 'vencido';
  }
};

export const abrirWhatsApp = (link: string): void => {
  window.open(link, '_blank');
};
