
import { Cliente } from "@/types";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";

export const sortClientesByOrder = (clientes: Cliente[], orderBy: ClienteOrderType): Cliente[] => {
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
  const currentYear = currentDate.getFullYear();
  
  switch (orderBy) {
    case 'nome_asc':
      return clientes.sort((a, b) => a.nome.localeCompare(b.nome));
    case 'nome_desc':
      return clientes.sort((a, b) => b.nome.localeCompare(a.nome));
    case 'vencimento':
      return clientes.sort((a, b) => {
        const calcularPrioridadeVencimento = (cliente: Cliente) => {
          // Get the last day of current month
          const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
          const adjustedDueDay = Math.min(cliente.dia_vencimento, lastDayOfMonth);
          
          if (cliente.status === 'inativo') {
            // Cliente inativo - calcular há quantos dias venceu (valor negativo = maior prioridade)
            if (currentDay > adjustedDueDay) {
              // Venceu neste mês
              const daysPastDue = currentDay - adjustedDueDay;
              return -daysPastDue; // Negativo para dar prioridade aos mais vencidos
            } else if (currentDay === adjustedDueDay) {
              return 0; // Venceu hoje
            } else {
              // Venceu no mês passado
              const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
              const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
              const lastMonthLastDay = new Date(lastMonthYear, lastMonth, 0).getDate();
              const lastMonthAdjustedDueDay = Math.min(cliente.dia_vencimento, lastMonthLastDay);
              
              const daysFromDueToEndOfLastMonth = lastMonthLastDay - lastMonthAdjustedDueDay;
              const daysInCurrentMonth = currentDay;
              const totalDaysPastDue = daysFromDueToEndOfLastMonth + daysInCurrentMonth;
              
              return -totalDaysPastDue; // Negativo para dar prioridade aos mais vencidos
            }
          } else {
            // Cliente ativo - calcular quando será o próximo vencimento
            if (currentDay < adjustedDueDay) {
              // Próximo vencimento é neste mês
              const daysUntilDue = adjustedDueDay - currentDay;
              return daysUntilDue + 1000; // Somar 1000 para que ativos venham depois dos inativos
            } else if (currentDay === adjustedDueDay) {
              return 1000; // Vence hoje, mas é ativo
            } else {
              // Próximo vencimento é no mês seguinte
              const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
              const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
              const nextMonthLastDay = new Date(nextMonthYear, nextMonth, 0).getDate();
              const nextMonthAdjustedDueDay = Math.min(cliente.dia_vencimento, nextMonthLastDay);
              
              const daysToEndOfCurrentMonth = lastDayOfMonth - currentDay;
              const daysInNextMonth = nextMonthAdjustedDueDay;
              const totalDaysUntilDue = daysToEndOfCurrentMonth + daysInNextMonth;
              
              return totalDaysUntilDue + 1000; // Somar 1000 para que ativos venham depois dos inativos
            }
          }
        };
        
        const prioridadeA = calcularPrioridadeVencimento(a);
        const prioridadeB = calcularPrioridadeVencimento(b);
        
        return prioridadeA - prioridadeB;
      });
    case 'data':
    default:
      return clientes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
};
