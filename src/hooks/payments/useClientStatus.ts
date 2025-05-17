
import { Cliente, ClienteComPagamentos, Pagamento } from "@/types";

export const determineClientStatus = (
  cliente: ClienteComPagamentos,
  allPagamentos: Pagamento[]
): string => {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  const diaAtual = hoje.getDate();
  
  let mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
  let anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;
  
  // Verificar se há pagamento para o mês atual
  const pagamentoMesAtual = allPagamentos.find(
    p => 
      p.cliente_id === cliente.id && 
      p.mes === mesAtual && 
      p.ano === anoAtual && 
      (p.status === "pago" || p.status === "pago_confianca")
  );
  
  // Se pagou o mês atual, está ativo
  if (pagamentoMesAtual) {
    return "ativo";
  }
  
  // Verificar se há pagamento para o mês anterior
  const pagamentoMesAnterior = allPagamentos.find(
    p => 
      p.cliente_id === cliente.id && 
      p.mes === mesAnterior && 
      p.ano === anoAnterior && 
      (p.status === "pago" || p.status === "pago_confianca")
  );
  
  // Se pagou o mês anterior e ainda não chegou no dia do vencimento, está ativo
  if (pagamentoMesAnterior && diaAtual <= cliente.dia_vencimento) {
    return "ativo";
  }
  
  // Em qualquer outro caso, está inativo
  return "inativo";
};

// Função auxiliar que pode ser usada em outros contextos futuramente
export const updateClienteStatus = (
  clientes: Cliente[], 
  clienteId: string, 
  newStatus: string
): Cliente[] => {
  return clientes.map(cliente => 
    cliente.id === clienteId ? { ...cliente, status: newStatus } : cliente
  );
};
