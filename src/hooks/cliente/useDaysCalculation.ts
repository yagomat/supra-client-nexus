
import { useMemo } from "react";
import { Cliente, Pagamento } from "@/types";
import { useBackendCalculatedDays } from "./useBackendCalculatedDays";
import { secureLog } from "@/utils/secureLogger";

export const useDaysCalculation = (cliente: Cliente, allPayments: Pagamento[]) => {
  // Usar o hook otimizado com backend quando possível
  const { paymentStatus, loading, error } = useBackendCalculatedDays(cliente);
  
  // Fallback para cálculo local apenas se o backend falhar
  const localCalculation = useMemo(() => {
    if (!error && !loading) {
      return null; // Usar resultado do backend
    }

    // Log seguro apenas com informações não sensíveis
    secureLog.clientOperation('Days calculation fallback', {
      paymentCount: allPayments.length,
      hasCliente: !!cliente,
      timestamp: new Date().toISOString(),
      usingFallback: true
    });
    
    // Lógica de fallback simplificada
    if (allPayments.length === 0) {
      return {
        type: 'no_info' as const,
        days: 0
      };
    }

    // Cálculo básico para fallback
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    const currentMonthPayment = allPayments.find(p => 
      p.ano === currentYear && 
      p.mes === currentMonth && 
      (p.status === 'pago' || p.status === 'pago_confianca')
    );

    if (currentMonthPayment && cliente.status === 'ativo') {
      const nextDueDate = new Date(currentYear, currentMonth, cliente.dia_vencimento);
      const daysDiff = Math.floor((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0) {
        return { type: 'upcoming' as const, days: daysDiff };
      } else if (daysDiff === 0) {
        return { type: 'today' as const, days: 0 };
      } else {
        return { type: 'overdue' as const, days: Math.abs(daysDiff) };
      }
    }

    return { type: 'no_info' as const, days: 0 };
  }, [cliente, allPayments, error, loading]);

  // Retornar resultado do backend ou fallback local
  return error || loading ? (localCalculation || { type: 'no_info' as const, days: 0 }) : paymentStatus;
};
