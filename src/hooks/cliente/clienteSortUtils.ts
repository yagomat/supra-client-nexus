
import { Cliente, Pagamento } from "@/types";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { calculateSortingPriority } from "./paymentCalculationUtils";

export const sortClientesByOrder = (
  clientes: Cliente[], 
  orderBy: ClienteOrderType,
  clientesPayments?: Map<string, Pagamento[]>
): Cliente[] => {
  switch (orderBy) {
    case 'nome_asc':
      return clientes.sort((a, b) => a.nome.localeCompare(b.nome));
    case 'nome_desc':
      return clientes.sort((a, b) => b.nome.localeCompare(a.nome));
    case 'vencimento':
      if (!clientesPayments) {
        // Fallback para lógica original se não temos os pagamentos
        return sortByOriginalVencimentoLogic(clientes);
      }
      
      return clientes.sort((a, b) => {
        const paymentsA = clientesPayments.get(a.id) || [];
        const paymentsB = clientesPayments.get(b.id) || [];
        
        const prioridadeA = calculateSortingPriority(a, paymentsA);
        const prioridadeB = calculateSortingPriority(b, paymentsB);
        
        return prioridadeA - prioridadeB;
      });
    case 'data':
    default:
      return clientes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
};

// Manter lógica original como fallback
const sortByOriginalVencimentoLogic = (clientes: Cliente[]): Cliente[] => {
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  return clientes.sort((a, b) => {
    const calcularPrioridadeVencimento = (cliente: Cliente) => {
      const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
      const adjustedDueDay = Math.min(cliente.dia_vencimento, lastDayOfMonth);
      
      if (cliente.status === 'inativo') {
        if (currentDay > adjustedDueDay) {
          const daysPastDue = currentDay - adjustedDueDay;
          return -daysPastDue;
        } else if (currentDay === adjustedDueDay) {
          return 0;
        } else {
          const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
          const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
          const lastMonthLastDay = new Date(lastMonthYear, lastMonth, 0).getDate();
          const lastMonthAdjustedDueDay = Math.min(cliente.dia_vencimento, lastMonthLastDay);
          
          const daysFromDueToEndOfLastMonth = lastMonthLastDay - lastMonthAdjustedDueDay;
          const daysInCurrentMonth = currentDay;
          const totalDaysPastDue = daysFromDueToEndOfLastMonth + daysInCurrentMonth;
          
          return -totalDaysPastDue;
        }
      } else {
        if (currentDay < adjustedDueDay) {
          const daysUntilDue = adjustedDueDay - currentDay;
          return daysUntilDue + 1000;
        } else if (currentDay === adjustedDueDay) {
          return 1000;
        } else {
          const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
          const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
          const nextMonthLastDay = new Date(nextMonthYear, nextMonth, 0).getDate();
          const nextMonthAdjustedDueDay = Math.min(cliente.dia_vencimento, nextMonthLastDay);
          
          const daysToEndOfCurrentMonth = lastDayOfMonth - currentDay;
          const daysInNextMonth = nextMonthAdjustedDueDay;
          const totalDaysUntilDue = daysToEndOfCurrentMonth + daysInNextMonth;
          
          return totalDaysUntilDue + 1000;
        }
      }
    };
    
    const prioridadeA = calcularPrioridadeVencimento(a);
    const prioridadeB = calcularPrioridadeVencimento(b);
    
    return prioridadeA - prioridadeB;
  });
};
