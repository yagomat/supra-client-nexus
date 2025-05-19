
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Pagamento, ClienteComPagamentos } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// No need to pass pagamentos and setPagamentos since we're not managing them here anymore
export const usePaymentStatus = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // We don't need to enable realtime or subscribe here as that's now centralized in useClientesPagamentos
  
  const handleChangeStatus = async (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => {
    try {
      setSubmitting(true);
      
      // Call our Supabase function to handle the payment status update
      const { error } = await supabase.rpc(
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
      
      // No need to manually update state as we're now subscribed to real-time updates
      // through the centralized subscription in useClientesPagamentos
      
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
