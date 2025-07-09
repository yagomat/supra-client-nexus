
import { useMemo } from "react";
import { Cliente, Pagamento } from "@/types";
import { calculatePaymentStatus } from "./paymentCalculationUtils";

export const useDaysCalculation = (cliente: Cliente, allPayments: Pagamento[]) => {
  return useMemo(() => {
    console.log(`useDaysCalculation for ${cliente.nome}:`, allPayments.length, 'payments');
    return calculatePaymentStatus(cliente, allPayments);
  }, [
    cliente.id, 
    cliente.dia_vencimento, 
    cliente.status,
    // Usar uma chave baseada nos pagamentos que força recálculo quando há mudanças
    // Incluir mais detalhes para detectar qualquer mudança relevante
    allPayments.length,
    JSON.stringify(allPayments.map(p => ({ 
      id: p.id, 
      status: p.status, 
      mes: p.mes, 
      ano: p.ano,
      data_pagamento: p.data_pagamento 
    })))
  ]);
};
