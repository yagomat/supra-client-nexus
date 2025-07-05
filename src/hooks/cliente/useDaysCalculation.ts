
import { useMemo } from "react";
import { Cliente } from "@/types";

export const useDaysCalculation = (cliente: Cliente, statusPagamento?: string) => {
  return useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Se já pagou este mês, calcular para o próximo mês
    if (statusPagamento === 'pago' || statusPagamento === 'pago_confianca') {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const nextMonthLastDay = new Date(nextMonthYear, nextMonth, 0).getDate();
      const adjustedDueDay = Math.min(cliente.dia_vencimento, nextMonthLastDay);
      
      const daysInCurrentMonth = new Date(currentYear, currentMonth, 0).getDate();
      const daysUntilEndOfCurrentMonth = daysInCurrentMonth - currentDay;
      const totalDaysUntilDue = daysUntilEndOfCurrentMonth + adjustedDueDay;
      
      return { type: 'upcoming' as const, days: totalDaysUntilDue };
    }
    
    // Lógica original para quando não pagou ainda
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
    const adjustedDueDay = Math.min(cliente.dia_vencimento, lastDayOfMonth);
    
    if (cliente.status === 'inativo') {
      if (currentDay > adjustedDueDay) {
        const daysPastDue = currentDay - adjustedDueDay;
        return { type: 'overdue' as const, days: daysPastDue };
      } 
      else if (currentDay === adjustedDueDay) {
        return { type: 'today' as const, days: 0 };
      } 
      else {
        const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        const lastMonthLastDay = new Date(lastMonthYear, lastMonth, 0).getDate();
        const lastMonthAdjustedDueDay = Math.min(cliente.dia_vencimento, lastMonthLastDay);
        
        const daysFromDueToEndOfLastMonth = lastMonthLastDay - lastMonthAdjustedDueDay;
        const daysInCurrentMonth = currentDay;
        
        const totalDaysPastDue = daysFromDueToEndOfLastMonth + daysInCurrentMonth;
        return { type: 'overdue' as const, days: totalDaysPastDue };
      }
    } else {
      if (currentDay < adjustedDueDay) {
        const daysUntilDue = adjustedDueDay - currentDay;
        return { type: 'upcoming' as const, days: daysUntilDue };
      } 
      else if (currentDay === adjustedDueDay) {
        return { type: 'today' as const, days: 0 };
      } 
      else {
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        const nextMonthLastDay = new Date(nextMonthYear, nextMonth, 0).getDate();
        const nextMonthAdjustedDueDay = Math.min(cliente.dia_vencimento, nextMonthLastDay);
        
        const daysToEndOfCurrentMonth = lastDayOfMonth - currentDay;
        const daysInNextMonth = nextMonthAdjustedDueDay;
        
        const totalDaysUntilDue = daysToEndOfCurrentMonth + daysInNextMonth;
        return { type: 'upcoming' as const, days: totalDaysUntilDue };
      }
    }
  }, [cliente.dia_vencimento, cliente.status, statusPagamento]);
};
