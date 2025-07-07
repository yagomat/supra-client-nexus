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

  // Se não há pagamentos válidos, usar lógica original
  if (validPayments.length === 0) {
    return calculateOriginalLogic(cliente, currentDay, currentMonth, currentYear);
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
  if (currentMonthPayment) {
    // Encontrar a sequência consecutiva mais longa começando do mês atual
    const consecutiveSequence = findConsecutiveSequence(validPayments, currentYear, currentMonth);
    
    // O vencimento será baseado no último mês da sequência consecutiva
    const lastConsecutivePayment = consecutiveSequence[consecutiveSequence.length - 1];
    const nextDueDate = calculateNextDueDate(lastConsecutivePayment, cliente.dia_vencimento);
    const daysDiff = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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

  // Para clientes INATIVOS (sem pagamento no mês atual)
  
  // Cenário: Cliente com pagamentos futuros mas sem pagamento presente
  if (futurePayments.length > 0 && pastAndCurrentPayments.length > 0) {
    // Mostrar vencimento baseado no último pagamento passado (em atraso)
    const lastPastPayment = pastAndCurrentPayments[0];
    const nextDueDate = calculateNextDueDate(lastPastPayment, cliente.dia_vencimento);
    const daysDiff = Math.ceil((today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      type: 'overdue',
      days: daysDiff,
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

  // Encontrar último pagamento válido (incluindo presente)
  const lastPayment = validPayments[0];
  
  // Calcular data de vencimento baseada no último pagamento
  const nextDueDate = calculateNextDueDate(lastPayment, cliente.dia_vencimento);
  
  // Calcular diferença de dias desde o vencimento do último pagamento
  const daysDiff = Math.ceil((today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24));

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
};

// Nova função para encontrar sequência consecutiva de pagamentos
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

const calculateOriginalLogic = (
  cliente: Cliente,
  currentDay: number,
  currentMonth: number,
  currentYear: number
): PaymentCalculationResult => {
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
  const adjustedDueDay = Math.min(cliente.dia_vencimento, lastDayOfMonth);
  
  if (cliente.status === 'inativo') {
    if (currentDay > adjustedDueDay) {
      const daysPastDue = currentDay - adjustedDueDay;
      return { type: 'overdue', days: daysPastDue };
    } 
    else if (currentDay === adjustedDueDay) {
      return { type: 'today', days: 0 };
    } 
    else {
      const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      const lastMonthLastDay = new Date(lastMonthYear, lastMonth, 0).getDate();
      const lastMonthAdjustedDueDay = Math.min(cliente.dia_vencimento, lastMonthLastDay);
      
      const daysFromDueToEndOfLastMonth = lastMonthLastDay - lastMonthAdjustedDueDay;
      const daysInCurrentMonth = currentDay;
      
      const totalDaysPastDue = daysFromDueToEndOfLastMonth + daysInCurrentMonth;
      return { type: 'overdue', days: totalDaysPastDue };
    }
  } else {
    if (currentDay < adjustedDueDay) {
      const daysUntilDue = adjustedDueDay - currentDay;
      return { type: 'upcoming', days: daysUntilDue };
    } 
    else if (currentDay === adjustedDueDay) {
      return { type: 'today', days: 0 };
    } 
    else {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const nextMonthLastDay = new Date(nextMonthYear, nextMonth, 0).getDate();
      const nextMonthAdjustedDueDay = Math.min(cliente.dia_vencimento, nextMonthLastDay);
      
      const daysToEndOfCurrentMonth = lastDayOfMonth - currentDay;
      const daysInNextMonth = nextMonthAdjustedDueDay;
      
      const totalDaysUntilDue = daysToEndOfCurrentMonth + daysInNextMonth;
      return { type: 'upcoming', days: totalDaysUntilDue };
    }
  }
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
