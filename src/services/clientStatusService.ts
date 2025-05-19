
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

/**
 * Recalcula o status de um único cliente específico no backend
 * Esta função apenas aciona o trigger do Supabase para recalcular o status
 */
export async function recalculateClientStatus(clientId: string): Promise<void> {
  try {
    // Primeiro, recuperamos os pagamentos do cliente
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('cliente_id', clientId)
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })
      .limit(1);
    
    if (pagamentosError) {
      console.error("Erro ao buscar pagamentos do cliente:", pagamentosError);
      throw pagamentosError;
    }
    
    // Se existe pelo menos um pagamento, atualizamos para acionar o trigger
    if (pagamentos && pagamentos.length > 0) {
      const ultimoPagamento = pagamentos[0];
      
      // Atualizar o último pagamento para acionar o trigger update_cliente_status
      const { error: updateError } = await supabase
        .from('pagamentos')
        .update({ status: ultimoPagamento.status })
        .eq('id', ultimoPagamento.id);
      
      if (updateError) {
        console.error("Erro ao acionar recálculo de status:", updateError);
        throw updateError;
      }
    } else {
      // Se não tem pagamentos, definimos o cliente como inativo diretamente
      const { error: clienteError } = await supabase
        .from('clientes')
        .update({ status: 'inativo' })
        .eq('id', clientId);
        
      if (clienteError) {
        console.error("Erro ao definir cliente como inativo:", clienteError);
        throw clienteError;
      }
    }
    
    console.log("Status do cliente recalculado com sucesso");
  } catch (error) {
    console.error("Erro ao recalcular status do cliente:", error);
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
