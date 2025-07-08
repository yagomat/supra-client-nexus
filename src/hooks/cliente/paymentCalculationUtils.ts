import { Cliente, Pagamento } from "@/types";

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
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar para início do dia
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Filtrar apenas pagamentos válidos e ordenar por data
  const validPayments = allPayments
    .filter(p => p.status === 'pago' || p.status === 'pago_confianca')
    .sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      return b.mes - a.mes;
    });

  // Se não há pagamentos válidos, não mostrar informação de vencimento
  if (validPayments.length === 0) {
    return {
      type: 'no_info',
      days: 0
    };
  }

  // Separar pagamentos passados/presentes e futuros
  const pastAndCurrentPayments = validPayments.filter(p => 
    p.ano < currentYear || (p.ano === currentYear && p.mes <= currentMonth)
  );
  
  const futurePayments = validPayments.filter(p => 
    p.ano > currentYear || (p.ano === currentYear && p.mes > currentMonth)
  );

  // Verificar se tem pagamento no mês atual
  const currentMonthPayment = validPayments.find(p => 
    p.ano === currentYear && p.mes === currentMonth
  );

  // Para clientes ATIVOS (com pagamento no mês atual)
  if (currentMonthPayment && cliente.status === 'ativo') {
    // Encontrar a sequência consecutiva mais longa começando do mês atual
    const consecutiveSequence = findConsecutiveSequence(validPayments, currentYear, currentMonth);
    
    // O vencimento será baseado no último mês da sequência consecutiva
    const lastConsecutivePayment = consecutiveSequence[consecutiveSequence.length - 1];
    const nextDueDate = calculateNextDueDate(lastConsecutivePayment, cliente.dia_vencimento);
    nextDueDate.setHours(0, 0, 0, 0); // Normalizar para início do dia
    
    const daysDiff = Math.floor((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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
  
  // Cenário: Cliente com pagamentos futuros mas sem pagamento presente
  if (futurePayments.length > 0 && pastAndCurrentPayments.length > 0) {
    // Mostrar vencimento baseado no último pagamento passado (em atraso)
    const lastPastPayment = pastAndCurrentPayments[0];
    const nextDueDate = calculateNextDueDate(lastPastPayment, cliente.dia_vencimento);
    nextDueDate.setHours(0, 0, 0, 0); // Normalizar para início do dia
    
    const daysDiff = Math.floor((today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      type: 'overdue',
      days: Math.max(daysDiff, 1), // Garantir que seja pelo menos 1 dia
      lastPaymentDate: new Date(lastPastPayment.ano, lastPastPayment.mes - 1),
      nextDueDate
    };
  }

  // Cenário: Cliente com apenas pagamentos futuros (sem histórico passado/presente)
  if (futurePayments.length > 0 && pastAndCurrentPayments.length === 0) {
    return {
      type: 'no_info',
      days: 0
    };
  }

  // Cliente inativo com histórico de pagamentos
  if (pastAndCurrentPayments.length > 0) {
    const lastPayment = pastAndCurrentPayments[0];
    const nextDueDate = calculateNextDueDate(lastPayment, cliente.dia_vencimento);
    nextDueDate.setHours(0, 0, 0, 0); // Normalizar para início do dia
    
    const daysDiff = Math.floor((today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24));

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

const findConsecutiveSequence = (payments: Pagamento[], startYear: number, startMonth: number): Pagamento[] => {
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
  
  return new Date(nextYear, nextMonth - 1, adjustedDueDay);
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
