
import { Cliente, Pagamento } from "@/types";

export interface PaymentCalculationResult {
  type: 'overdue' | 'today' | 'upcoming';
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

  // Encontrar último pagamento válido
  const lastPayment = validPayments[0];
  
  // Calcular data de vencimento baseada no último pagamento
  const nextDueDate = calculateNextDueDate(lastPayment, cliente.dia_vencimento);
  
  // Verificar se há pagamentos futuros
  const futurePayments = validPayments.filter(p => 
    p.ano > currentYear || (p.ano === currentYear && p.mes > currentMonth)
  );

  if (futurePayments.length > 0) {
    // Se há pagamentos futuros, calcular baseado no mais próximo
    const nextFuturePayment = futurePayments
      .sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano;
        return a.mes - b.mes;
      })[0];
    
    const futureDueDate = calculateNextDueDate(nextFuturePayment, cliente.dia_vencimento);
    const daysDiff = Math.ceil((futureDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      type: daysDiff === 0 ? 'today' : 'upcoming',
      days: Math.abs(daysDiff),
      nextDueDate: futureDueDate
    };
  }

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

// Função para ordenação por vencimento considerando histórico completo
export const calculateSortingPriority = (
  cliente: Cliente,
  allPayments: Pagamento[]
): number => {
  const result = calculatePaymentStatus(cliente, allPayments);
  
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
