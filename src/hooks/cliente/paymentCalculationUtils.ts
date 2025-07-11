import { Cliente, Pagamento } from "@/types";
import { getCurrentDayInfo, getDaysDifference, toSystemTimezone } from "@/utils/timezone";

export interface PaymentCalculationResult {
  type: 'overdue' | 'today' | 'upcoming' | 'no_info';
  days: number;
  lastPaymentDate?: Date;
  nextDueDate?: Date;
}

export const calculatePaymentStatus = (
  cliente: Cliente,
  allPayments: Pagamento[]
): PaymentCalculationResult => {
  // Usar informações de data do sistema padronizado
  const { day: currentDay, month: currentMonth, year: currentYear } = getCurrentDayInfo();

  // Filtrar apenas pagamentos válidos e ordenar por data
  const validPayments = allPayments
    .filter(p => p.status === 'pago' || p.status === 'pago_confianca')
    .sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mes - b.mes;
    });

  // Se não há pagamentos válidos, não mostrar informação de vencimento
  if (validPayments.length === 0) {
    return {
      type: 'no_info',
      days: 0
    };
  }

  // Verificar se tem pagamento no mês atual
  const currentMonthPayment = validPayments.find(p => 
    p.ano === currentYear && p.mes === currentMonth
  );

  // Para clientes ATIVOS (com pagamento no mês atual)
  if (currentMonthPayment && cliente.status === 'ativo') {
    // Encontrar a sequência consecutiva mais longa A PARTIR do mês atual
    const consecutiveSequence = findConsecutiveSequenceFromCurrent(validPayments, currentYear, currentMonth);
    
    // O vencimento será baseado no último mês da sequência consecutiva
    const lastConsecutivePayment = consecutiveSequence[consecutiveSequence.length - 1];
    const nextDueDate = calculateNextDueDate(lastConsecutivePayment, cliente.dia_vencimento);
    
    // Usar função de timezone para calcular diferença
    const daysDiff = getDaysDifference(new Date(), nextDueDate);

    if (daysDiff > 0) {
      return {
        type: 'upcoming',
        days: daysDiff,
        nextDueDate
      };
    } else if (daysDiff === 0) {
      return {
        type: 'today',
        days: 0,
        nextDueDate
      };
    } else {
      return {
        type: 'overdue',
        days: Math.abs(daysDiff),
        nextDueDate
      };
    }
  }

  // Para clientes INATIVOS (sem pagamento no mês atual ou status inativo)
  
  // Separar pagamentos passados/presentes dos futuros
  const pastAndCurrentPayments = validPayments.filter(p => 
    p.ano < currentYear || (p.ano === currentYear && p.mes <= currentMonth)
  );
  
  const futurePayments = validPayments.filter(p => 
    p.ano > currentYear || (p.ano === currentYear && p.mes > currentMonth)
  );

  // Cenário: Cliente com pagamentos futuros mas sem pagamento presente
  // IGNORAR pagamentos futuros isolados para cálculo de vencimento
  if (futurePayments.length > 0 && pastAndCurrentPayments.length === 0) {
    return {
      type: 'no_info',
      days: 0
    };
  }

  // Cliente com histórico de pagamentos (mas sem pagamento atual)
  if (pastAndCurrentPayments.length > 0) {
    // Encontrar a sequência consecutiva mais recente que termina no passado/presente
    const lastConsecutiveSequence = findLastConsecutiveSequence(pastAndCurrentPayments, currentYear, currentMonth);
    
    if (lastConsecutiveSequence.length === 0) {
      return {
        type: 'no_info',
        days: 0
      };
    }

    const lastPayment = lastConsecutiveSequence[lastConsecutiveSequence.length - 1];
    const nextDueDate = calculateNextDueDate(lastPayment, cliente.dia_vencimento);
    
    // Usar função de timezone para calcular diferença
    const daysDiff = getDaysDifference(nextDueDate, new Date());

    if (daysDiff > 0) {
      return {
        type: 'overdue',
        days: daysDiff,
        lastPaymentDate: new Date(lastPayment.ano, lastPayment.mes - 1),
        nextDueDate
      };
    } else if (daysDiff === 0) {
      return {
        type: 'today',
        days: 0,
        nextDueDate
      };
    } else {
      return {
        type: 'upcoming',
        days: Math.abs(daysDiff),
        nextDueDate
      };
    }
  }

  // Fallback: sem informação
  return {
    type: 'no_info',
    days: 0
  };
};

// Nova função para encontrar sequência consecutiva A PARTIR do mês atual
const findConsecutiveSequenceFromCurrent = (payments: Pagamento[], startYear: number, startMonth: number): Pagamento[] => {
  const sequence: Pagamento[] = [];
  let currentYear = startYear;
  let currentMonth = startMonth;

  // Continuar até encontrar um gap na sequência
  while (true) {
    const payment = payments.find(p => p.ano === currentYear && p.mes === currentMonth);
    
    if (!payment) {
      break; // Gap encontrado, parar a sequência
    }
    
    sequence.push(payment);
    
    // Avançar para o próximo mês
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return sequence;
};

// Nova função para encontrar a última sequência consecutiva no passado/presente
const findLastConsecutiveSequence = (payments: Pagamento[], currentYear: number, currentMonth: number): Pagamento[] => {
  if (payments.length === 0) return [];

  // Ordenar por data decrescente
  const sortedPayments = [...payments].sort((a, b) => {
    if (a.ano !== b.ano) return b.ano - a.ano;
    return b.mes - a.mes;
  });

  // Começar do pagamento mais recente e ir para trás
  const sequence: Pagamento[] = [];
  let expectedYear = sortedPayments[0].ano;
  let expectedMonth = sortedPayments[0].mes;

  for (const payment of sortedPayments) {
    if (payment.ano === expectedYear && payment.mes === expectedMonth) {
      sequence.unshift(payment); // Adicionar no início para manter ordem cronológica
      
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

  return sequence;
};

const calculateNextDueDate = (payment: Pagamento, diaVencimento: number): Date => {
  // A data de vencimento é no mês seguinte ao do pagamento
  let nextMonth = payment.mes + 1;
  let nextYear = payment.ano;
  
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  
  // Ajustar dia de vencimento para o último dia do mês se necessário
  const lastDayOfMonth = new Date(nextYear, nextMonth, 0).getDate();
  const adjustedDueDay = Math.min(diaVencimento, lastDayOfMonth);
  
  // Retornar data no timezone do sistema
  const dueDate = new Date(nextYear, nextMonth - 1, adjustedDueDay);
  return toSystemTimezone(dueDate);
};

export const calculateSortingPriority = (
  cliente: Cliente,
  allPayments: Pagamento[]
): number => {
  const result = calculatePaymentStatus(cliente, allPayments);
  
  // Clientes sem informação de vencimento vão para o final
  if (result.type === 'no_info') {
    return 10000;
  }
  
  if (cliente.status === 'inativo') {
    // Clientes inativos têm prioridade maior (valores negativos)
    if (result.type === 'overdue') {
      return -result.days; // Mais negativo = maior prioridade
    } else {
      return -1000; // Prioridade alta para inativos
    }
  } else {
    // Clientes ativos vêm depois (valores positivos)
    if (result.type === 'upcoming') {
      return result.days + 1000; // Soma 1000 para vir depois dos inativos
    } else if (result.type === 'today') {
      return 1000; // Vence hoje mas é ativo
    } else {
      return 1500; // Outros casos de ativos
    }
  }
};
