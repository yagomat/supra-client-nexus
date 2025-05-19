
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Pagamento, ClienteComPagamentos } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { meses } from "./usePaymentFilters";
import { enableRealtimeForTable } from "@/services/clientStatusService";

export const usePaymentStatus = (
  pagamentos: Pagamento[],
  setPagamentos: (pagamentos: Pagamento[]) => void
) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Enable realtime for pagamentos table on component mount
  useEffect(() => {
    const setupRealtime = async () => {
      try {
        await enableRealtimeForTable('pagamentos');
      } catch (error) {
        console.error("Error enabling realtime for pagamentos:", error);
      }
    };
    
    setupRealtime();
  }, []);

  // Subscribe to real-time payment changes
  useEffect(() => {
    // Subscribe to changes on the pagamentos table
    const pagamentosChannel = supabase
      .channel('pagamentos-changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pagamentos'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            // Create a new array with all existing payments plus the new one
            setPagamentos([...pagamentos, payload.new as Pagamento]);
            
            toast({
              title: "Novo pagamento registrado",
              description: `Pagamento de ${meses.find((m) => m.value === payload.new.mes)?.label} registrado com sucesso.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            // Create a new array by replacing the updated payment
            setPagamentos(pagamentos.map(p => 
              p.id === payload.new.id ? (payload.new as Pagamento) : p
            ));
            
            toast({
              title: "Status de pagamento atualizado",
              description: `Pagamento de ${meses.find((m) => m.value === payload.new.mes)?.label} atualizado com sucesso.`,
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(pagamentosChannel);
    };
  }, [pagamentos, toast, setPagamentos]);

  const handleChangeStatus = async (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => {
    try {
      setSubmitting(true);
      
      // Call our Supabase function to handle the payment status update
      // This function already handles both creation and update of payments
      // and automatically triggers the update_cliente_status trigger
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
      
      // No need to manually update the state here as we're now subscribed
      // to real-time updates through the pagamentos-changes channel
      
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
