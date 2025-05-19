
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ClienteComPagamentos } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const usePaymentStatus = () => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleChangeStatus = async (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => {
    try {
      setSubmitting(true);
      
      // Call Supabase function to handle payment status update
      // This will trigger the database triggers and realtime updates
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
      
      // No need to manually update state as we're subscribed to real-time updates
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
