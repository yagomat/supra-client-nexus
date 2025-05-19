
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Pagamento, ClienteComPagamentos } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { meses } from "./usePaymentFilters";

// Define the response type from our Supabase function
interface PaymentStatusUpdateResponse {
  action: 'created' | 'updated';
  pagamento: Pagamento;
}

export const usePaymentStatus = (
  pagamentos: Pagamento[],
  setPagamentos: (pagamentos: Pagamento[]) => void
) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChangeStatus = async (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => {
    try {
      setSubmitting(true);
      
      // Call our Supabase function to handle the payment status update
      const { data, error } = await supabase.rpc(
        'handle_payment_status_update', 
        { 
          p_cliente_id: cliente.id,
          p_mes: mes,
          p_ano: ano,
          p_status: status
        }
      );
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error("No data returned from payment status update");
      }
      
      // First cast to unknown, then to our interface type for safety
      const response = data as unknown as PaymentStatusUpdateResponse;
      
      // Extract the payment data from the function result
      const updatedPagamento = response.pagamento;
      
      // Update local state based on whether it was a new record or an update
      let updatedPagamentosArray: Pagamento[];
      
      if (response.action === 'created') {
        // Add the new payment to the array
        updatedPagamentosArray = [...pagamentos, updatedPagamento];
        
        toast({
          title: "Pagamento registrado",
          description: `Pagamento de ${meses.find((m) => m.value === mes)?.label} registrado com sucesso.`,
        });
      } else {
        // Update existing payment
        updatedPagamentosArray = pagamentos.map((p) => 
          (p.id === updatedPagamento.id ? updatedPagamento : p)
        );
        
        toast({
          title: "Status atualizado",
          description: `Pagamento de ${meses.find((m) => m.value === mes)?.label} atualizado com sucesso.`,
        });
      }
      
      // Update the local pagamentos state
      setPagamentos(updatedPagamentosArray);
      
    } catch (error) {
      console.error("Erro ao atualizar status de pagamento", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do pagamento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    submitting,
    handleChangeStatus,
  };
};
