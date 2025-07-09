
import { useMemo } from "react";
import { Cliente, Pagamento } from "@/types";
import { calculatePaymentStatus } from "./paymentCalculationUtils";

export const useDaysCalculation = (cliente: Cliente, allPayments: Pagamento[]) => {
  return useMemo(() => {
    if (!cliente || !Array.isArray(allPayments)) {
      return {
        type: 'no_info' as const,
        days: 0
      };
    }
    
    return calculatePaymentStatus(cliente, allPayments);
  }, [cliente.id, cliente.dia_vencimento, cliente.status, allPayments.length, JSON.stringify(allPayments.map(p => ({ id: p.id, status: p.status, mes: p.mes, ano: p.ano })))]);
};
