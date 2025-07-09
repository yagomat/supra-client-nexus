
import { useMemo } from "react";
import { Cliente, Pagamento } from "@/types";
import { calculatePaymentStatus } from "./paymentCalculationUtils";

export const useDaysCalculation = (cliente: Cliente, allPayments: Pagamento[]) => {
  return useMemo(() => {
    return calculatePaymentStatus(cliente, allPayments);
  }, [cliente.dia_vencimento, cliente.status, allPayments]);
};
