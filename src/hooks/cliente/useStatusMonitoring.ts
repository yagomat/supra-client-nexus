
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { updateCliente, getCliente } from "@/services/clienteService";
import { recalculateClientStatus } from "@/services/clientStatusService";
import { Pagamento, ClienteFormValues } from "@/types";

export const useStatusMonitoring = (
  form: UseFormReturn<ClienteFormValues>,
  clienteId: string | undefined,
  clientePagamentos: Pagamento[],
  originalVencimento: number
) => {
  useEffect(() => {
    const subscription = form.watch(async (value, { name }) => {
      // Se o dia de vencimento foi alterado
      if (name === "dia_vencimento" && clienteId && clientePagamentos.length > 0) {
        const newVencimento = Number(value.dia_vencimento);
        
        // Verificar se o vencimento foi realmente alterado
        if (newVencimento !== originalVencimento) {
          try {
            // Primeiro atualiza o dia de vencimento no backend
            await updateCliente(clienteId, { dia_vencimento: newVencimento });
            
            // Em seguida, aciona a recalculação de status no Supabase
            await recalculateClientStatus(clienteId);
            
            // Busca o cliente atualizado para obter o novo status
            const clienteAtualizado = await getCliente(clienteId);
            
            // Atualiza o campo status no formulário
            form.setValue("status", clienteAtualizado.status);
          } catch (error) {
            console.error("Erro ao recalcular status do cliente:", error);
          }
        }
      }
    });
    
    // Cancelar a assinatura ao desmontar o componente
    return () => subscription.unsubscribe();
  }, [form, clienteId, clientePagamentos, originalVencimento]);
};
