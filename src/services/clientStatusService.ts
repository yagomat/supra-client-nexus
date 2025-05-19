
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

/**
 * Recalcula o status de um único cliente específico no backend
 * Usa a mesma lógica já implementada no Supabase
 */
export async function recalculateClientStatus(clientId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc(
      'recalculate_client_status',
      { client_id_param: clientId }
    );
    
    if (error) {
      console.error("Erro ao recalcular status do cliente:", error);
      throw error;
    }
    
    console.log("Status do cliente recalculado com sucesso");
  } catch (error) {
    console.error("Erro ao chamar função RPC:", error);
    throw error;
  }
}

/**
 * Função auxiliar para atualizar o array de clientes com um novo status
 * Esta função NÃO faz chamada ao backend, apenas atualiza o array local
 */
export const updateClienteStatus = (
  clientes: Cliente[], 
  clienteId: string, 
  newStatus: string
): Cliente[] => {
  return clientes.map(cliente => 
    cliente.id === clienteId ? { ...cliente, status: newStatus } : cliente
  );
};
