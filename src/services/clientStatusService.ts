
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
