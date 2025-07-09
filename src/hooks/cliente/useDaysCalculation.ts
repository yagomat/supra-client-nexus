
import { useMemo } from "react";
import { Cliente, Pagamento } from "@/types";
import { calculatePaymentStatus } from "./paymentCalculationUtils";

export const useDaysCalculation = (cliente: Cliente, allPayments: Pagamento[]) => {
  return useMemo(() => {
    console.log(`useDaysCalculation for ${cliente.nome}:`, allPayments.length, 'payments');
    return calculatePaymentStatus(cliente, allPayments);
  }, [cliente.id, cliente.dia_vencimento, cliente.status, allPayments]);
};
