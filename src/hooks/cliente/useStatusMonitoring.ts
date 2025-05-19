
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { updateCliente, getCliente } from "@/services/clienteService";
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
            // Apenas atualiza o dia de vencimento no backend
            // O status será recalculado automaticamente pelo trigger do Supabase
            await updateCliente(clienteId, { dia_vencimento: newVencimento });
            
            // Busca o cliente atualizado para obter o novo status
            const clienteAtualizado = await getCliente(clienteId);
            
            // Atualiza o campo status no formulário
            form.setValue("status", clienteAtualizado.status);
          } catch (error) {
            console.error("Erro ao atualizar dia de vencimento:", error);
          }
        }
      }
    });
    
    // Cancelar a assinatura ao desmontar o componente
    return () => subscription.unsubscribe();
  }, [form, clienteId, clientePagamentos, originalVencimento]);
};
