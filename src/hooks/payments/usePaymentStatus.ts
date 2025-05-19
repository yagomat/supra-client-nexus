
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Pagamento, ClienteComPagamentos } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { meses } from "./usePaymentFilters";
import { enableRealtimeForTable } from "@/services/clientStatusService";

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

  // Enable realtime for clientes table on component mount
  useEffect(() => {
    const setupRealtime = async () => {
      try {
        await enableRealtimeForTable('clientes');
        await enableRealtimeForTable('pagamentos');
      } catch (error) {
        console.error("Error enabling realtime:", error);
      }
    };
    
    setupRealtime();
  }, []);

  // Subscribe to real-time client status changes
  useEffect(() => {
    // Subscribe to changes on the clientes table
    const clientesChannel = supabase
      .channel('cliente-status-changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'clientes',
          filter: 'status=eq.ativo OR status=eq.inativo'
        }, 
        (payload) => {
          // Just display a toast notification to inform the user
          const newStatus = payload.new.status;
          toast({
            title: `Status do cliente atualizado`,
            description: `Cliente "${payload.new.nome}" agora está ${newStatus === 'ativo' ? 'ativo' : 'inativo'}.`,
          });
        }
      )
      .subscribe();

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
          // When payment changes happen, we sync our local state with the database
          if (payload.eventType === 'INSERT') {
            // Fix: Create a new array by spreading the existing pagamentos and adding the new one
            const updatedPagamentos = [...pagamentos, payload.new as Pagamento];
            setPagamentos(updatedPagamentos);
            
            toast({
              title: "Novo pagamento registrado",
              description: `Pagamento de ${meses.find((m) => m.value === payload.new.mes)?.label} registrado com sucesso.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            // Fix: Create a new array by mapping through the existing pagamentos and replacing the updated one
            const updatedPagamentos = pagamentos.map(p => 
              p.id === payload.new.id ? (payload.new as Pagamento) : p
            );
            setPagamentos(updatedPagamentos);
            
            toast({
              title: "Status de pagamento atualizado",
              description: `Pagamento de ${meses.find((m) => m.value === payload.new.mes)?.label} atualizado com sucesso.`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(clientesChannel);
      supabase.removeChannel(pagamentosChannel);
    };
  }, [pagamentos, toast, setPagamentos]);

  const handleChangeStatus = async (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => {
    try {
      setSubmitting(true);
      
      // Call our Supabase function to handle the payment status update
      // This function already handles both creation and update of payments
      // and automatically triggers the update_cliente_status trigger
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
