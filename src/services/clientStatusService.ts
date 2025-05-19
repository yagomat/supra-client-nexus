
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

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

/**
 * Função para atualizar o status de um cliente no backend
 */
export const updateClientStatus = async (clienteId: string): Promise<void> => {
  try {
    // Retrieve the client
    const { data: client, error: clientError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single();
      
    if (clientError) {
      throw clientError;
    }
    
    // Call the update_cliente_status function (if necessary)
    // This is a placeholder - the actual update happens through a trigger in Supabase
    // when a payment record is updated
    
    console.log(`Client status update was triggered for client ${clienteId}`);
  } catch (error) {
    console.error("Error updating client status:", error);
    throw error;
  }
};
