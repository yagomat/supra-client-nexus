
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Pagamento, ClienteComPagamentos } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import * as clientStatusService from "@/services/clientStatusService";
import { meses } from "./usePaymentFilters";

// Define the response type from our Supabase function
interface PaymentStatusUpdateResponse {
  action: 'created' | 'updated';
  pagamento: Pagamento;
}

export const usePaymentStatus = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Function to save payment status
  const savePaymentStatus = async (
    cliente: ClienteComPagamentos,
    ano: number,
    mes: number,
    status: string
  ) => {
    try {
      setSubmitting(true);
      
      // Create or update the payment as needed
      let pagamento: Partial<Pagamento> = {
        cliente_id: cliente.id,
        ano,
        mes,
        status,
      };

      // Check if client has pagamentos for this month and year
      const pagamentoKey = `${mes}-${ano}`;
      const existingPagamento = cliente.pagamentos[pagamentoKey];
      
      if (existingPagamento && existingPagamento.id) {
        pagamento.id = existingPagamento.id;
      }
      
      // If it has an ID, it's an existing payment that needs to be updated
      if (pagamento.id) {
        const { error } = await supabase
          .from("pagamentos")
          .update({
            status: pagamento.status,
            data_pagamento: 
              pagamento.status === "pago" || pagamento.status === "pago_confianca" 
                ? new Date().toISOString()
                : null
          })
          .eq("id", pagamento.id);

        if (error) throw error;
      } else {
        // If it doesn't exist, create a new payment
        const { data, error } = await supabase.rpc(
          'handle_payment_status_update', 
          { 
            p_cliente_id: cliente.id, 
            p_ano: ano, 
            p_mes: mes, 
            p_status: status 
          }
        );
        
        if (error) {
          throw error;
        }
        
        // Safe type assertion
        if (data) {
          // First cast to unknown, then to our specific type
          const responseData = data as unknown as PaymentStatusUpdateResponse;
          
          if (responseData && responseData.pagamento) {
            pagamento.id = responseData.pagamento.id;
            pagamento.status = responseData.pagamento.status;
            pagamento.data_pagamento = responseData.pagamento.data_pagamento;
          }
        }
      }

      toast({
        title: "Status atualizado",
        description: `O pagamento de ${cliente.nome} foi ${status === "pago" ? "confirmado" : status === "pago_confianca" ? "marcado como pago por confiança" : "marcado como não pago"}.`,
      });

      // If client status needs to be updated based on the payment
      if (status === "pago" || status === "pago_confianca") {
        try {
          await clientStatusService.updateClientStatus(cliente.id);
        } catch (error) {
          console.error("Erro ao atualizar status do cliente:", error);
        }
      }
      
      // Return the updated payment for state updates
      return pagamento as Pagamento;
      
    } catch (error) {
      console.error("Erro ao salvar status do pagamento:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o status do pagamento.",
        variant: "destructive",
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle status change
  const handleChangeStatus = async (
    cliente: ClienteComPagamentos, 
    mes: number, 
    ano: number, 
    status: string,
    setPagamentos: (value: React.SetStateAction<ClienteComPagamentos[]>) => void
  ) => {
    const updatedPagamento = await savePaymentStatus(cliente, ano, mes, status);
    
    if (updatedPagamento) {
      // Update the local list
      setPagamentos(prev => 
        prev.map(c => {
          if (c.id === cliente.id) {
            // Create a deep copy of the existing pagamentos
            const updatedPagamentos = { ...c.pagamentos };
            
            // Add or update the specific payment
            const key = `${mes}-${ano}`;
            updatedPagamentos[key] = updatedPagamento;
            
            return {
              ...c,
              pagamentos: updatedPagamentos
            };
          }
          return c;
        })
      );
    }
  };

  return {
    submitting,
    savePaymentStatus,
    handleChangeStatus
  };
};
