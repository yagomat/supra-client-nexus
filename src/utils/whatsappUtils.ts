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

// Função para calcular a próxima data de vencimento baseada nos pagamentos
const calcularProximaDataVencimento = (
  cliente: Cliente,
  allPayments: Pagamento[]
): Date | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Filtrar apenas pagamentos válidos e ordenar por data
  const validPayments = allPayments
    .filter(p => p.status === 'pago' || p.status === 'pago_confianca')
    .sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mes - b.mes;
    });

  if (validPayments.length === 0) {
    return null;
  }

  // Verificar se cliente tem pagamento no mês atual
  const temPagamentoAtual = validPayments.some(p => 
    p.ano === currentYear && p.mes === currentMonth
  );

  // Verificar se cliente tem pagamento no mês anterior
  let mesAnterior = currentMonth - 1;
  let anoAnterior = currentYear;
  if (mesAnterior === 0) {
    mesAnterior = 12;
    anoAnterior = currentYear - 1;
  }

  const temPagamentoAnterior = validPayments.some(p => 
    p.ano === anoAnterior && p.mes === mesAnterior
  );

  // Verificar se ainda não chegou o dia de vencimento no mês atual
  const diaAtual = today.getDate();
  const ultimoDiaDoMes = new Date(currentYear, currentMonth, 0).getDate();
  const diaVencimentoAjustado = Math.min(cliente.dia_vencimento, ultimoDiaDoMes);
  const aindaNaoVenceu = diaAtual <= diaVencimentoAjustado;

  // Determinar se cliente é ativo
  const clienteAtivo = temPagamentoAtual || (temPagamentoAnterior && aindaNaoVenceu);

  if (clienteAtivo) {
    // CLIENTE ATIVO: Encontrar sequência consecutiva a partir do mês atual ou anterior
    let pontoInicio: { mes: number, ano: number };
    
    if (temPagamentoAtual) {
      pontoInicio = { mes: currentMonth, ano: currentYear };
    } else {
      pontoInicio = { mes: mesAnterior, ano: anoAnterior };
    }

    // Encontrar sequência consecutiva SOMENTE para frente a partir do ponto de início
    const sequenciaConsecutiva = encontrarSequenciaConsecutivaParaFrente(validPayments, pontoInicio);
    
    if (sequenciaConsecutiva.length > 0) {
      const ultimoPagamento = sequenciaConsecutiva[sequenciaConsecutiva.length - 1];
      return calcularProximaData(ultimoPagamento, cliente.dia_vencimento);
    }
  } else {
    // CLIENTE INATIVO: Mostrar data de vencimento baseada no último pagamento consecutivo
    const ultimaSequenciaConsecutiva = encontrarUltimaSequenciaConsecutiva(validPayments);
    
    if (ultimaSequenciaConsecutiva.length > 0) {
      const ultimoPagamento = ultimaSequenciaConsecutiva[ultimaSequenciaConsecutiva.length - 1];
      return calcularProximaData(ultimoPagamento, cliente.dia_vencimento);
    }
  }

  return null;
};

// Nova função para encontrar sequência consecutiva APENAS para frente (sem gaps)
const encontrarSequenciaConsecutivaParaFrente = (
  validPayments: Pagamento[], 
  pontoInicio: { mes: number, ano: number }
): Pagamento[] => {
  const sequencia: Pagamento[] = [];
  let mesAtual = pontoInicio.mes;
  let anoAtual = pontoInicio.ano;

  // Continuar a sequência enquanto houver pagamentos consecutivos (SEM GAPS)
  while (true) {
    const pagamento = validPayments.find(p => p.mes === mesAtual && p.ano === anoAtual);
    
    if (!pagamento) {
      break; // Gap encontrado, parar sequência
    }
    
    sequencia.push(pagamento);
    
    // Avançar para o próximo mês
    mesAtual++;
    if (mesAtual > 12) {
      mesAtual = 1;
      anoAtual++;
    }
  }

  return sequencia;
};

// Nova função para encontrar a última sequência consecutiva válida (para clientes inativos)
const encontrarUltimaSequenciaConsecutiva = (validPayments: Pagamento[]): Pagamento[] => {
  if (validPayments.length === 0) return [];

  // Começar do pagamento mais recente e ir para trás procurando a sequência
  const sortedPayments = [...validPayments].sort((a, b) => {
    if (a.ano !== b.ano) return b.ano - a.ano;
    return b.mes - a.mes;
  });

  // Encontrar a maior sequência consecutiva terminando no pagamento mais recente
  const sequencia: Pagamento[] = [];
  let expectedYear = sortedPayments[0].ano;
  let expectedMonth = sortedPayments[0].mes;

  for (const payment of sortedPayments) {
    if (payment.ano === expectedYear && payment.mes === expectedMonth) {
      sequencia.unshift(payment); // Adicionar no início para manter ordem cronológica
      
      // Calcular mês anterior
      expectedMonth--;
      if (expectedMonth < 1) {
        expectedMonth = 12;
        expectedYear--;
      }
    } else {
      break; // Gap encontrado, parar a sequência
    }
  }

  return sequencia;
};

// Função para calcular a próxima data baseada no último pagamento
const calcularProximaData = (ultimoPagamento: Pagamento, diaVencimento: number): Date => {
  let proximoMes = ultimoPagamento.mes + 1;
  let proximoAno = ultimoPagamento.ano;
  
  if (proximoMes > 12) {
    proximoMes = 1;
    proximoAno += 1;
  }
  
  // Ajustar dia de vencimento para o último dia do mês se necessário
  const ultimoDiaDoMes = new Date(proximoAno, proximoMes, 0).getDate();
  const diaVencimentoAjustado = Math.min(diaVencimento, ultimoDiaDoMes);
  
  return new Date(proximoAno, proximoMes - 1, diaVencimentoAjustado);
};

// Nova função para formatar mensagem usando dados do cliente e pagamentos
export const formatarMensagemWhatsAppComCliente = (
  mensagem: string,
  cliente: Cliente,
  allPayments: Pagamento[] = []
): string => {
  const paymentStatus = calculatePaymentStatus(cliente, allPayments);
  
  let diasVencimento = 0;
  let dataVencimento = '';
  
  // Usar a nova função para calcular a próxima data de vencimento
  const proximaDataVencimento = calcularProximaDataVencimento(cliente, allPayments);
  
  if (proximaDataVencimento) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    proximaDataVencimento.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((proximaDataVencimento.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    diasVencimento = Math.abs(daysDiff);
    
    dataVencimento = format(proximaDataVencimento, "dd/MM/yyyy", {
      locale: ptBR
    });
  } else if (paymentStatus.type !== 'no_info' && paymentStatus.nextDueDate) {
    // Fallback para a lógica anterior se não conseguir calcular
    diasVencimento = paymentStatus.days;
    dataVencimento = format(paymentStatus.nextDueDate, "dd/MM/yyyy", {
      locale: ptBR
    });
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
