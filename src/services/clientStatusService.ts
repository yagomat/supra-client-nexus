
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";

/**
 * Recalcula o status de um único cliente específico no backend
 * Usa a mesma lógica já implementada no Supabase
 */
export async function recalculateClientStatus(clientId: string): Promise<void> {
  try {
    // Como não temos uma função RPC específica para um único cliente,
    // vamos utilizar uma chamada direta para atualizar o cliente
    // simulando o trigger que recalcula o status
    
    // Primeiro, recuperamos os pagamentos do cliente para determinar o status
    const { data: pagamentos, error: pagamentosError } = await supabase
      .from('pagamentos')
      .select('*')
      .eq('cliente_id', clientId)
      .order('ano', { ascending: false })
      .order('mes', { ascending: false });
    
    if (pagamentosError) {
      console.error("Erro ao buscar pagamentos do cliente:", pagamentosError);
      throw pagamentosError;
    }
    
    // Se temos pelo menos um pagamento, simulamos uma atualização para
    // disparar o trigger update_cliente_status
    if (pagamentos && pagamentos.length > 0) {
      const ultimoPagamento = pagamentos[0];
      
      // Atualizar o registro de pagamento para acionar o trigger
      // Em vez de updated_at, que não existe no tipo, usamos status para forçar a atualização
      const { error: updateError } = await supabase
        .from('pagamentos')
        .update({ status: ultimoPagamento.status })
        .eq('id', ultimoPagamento.id);
      
      if (updateError) {
        console.error("Erro ao atualizar pagamento para recalcular status:", updateError);
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
