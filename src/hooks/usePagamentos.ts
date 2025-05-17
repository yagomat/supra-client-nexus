
import { useClientesPagamentos } from "./payments/useClientesPagamentos";
import { usePaymentFilters } from "./payments/usePaymentFilters";
import { usePaymentStatus } from "./payments/usePaymentStatus";

export const usePagamentos = () => {
  // Carregar clientes e pagamentos
  const {
    clientes,
    setClientes, 
    pagamentos, 
    setPagamentos, 
    clientesComPagamentos,
    setClientesComPagamentos,
    loading,
    anoAtual,
    setAnoAtual
  } = useClientesPagamentos();

  // Filtros e pesquisa
  const {
    mesAtual,
    setMesAtual,
    searchTerm,
    setSearchTerm,
    filteredClientes,
    handleLimparFiltro,
    meses,
    anos
  } = usePaymentFilters(clientesComPagamentos);

  // Função auxiliar para atualizar status dos clientes em todos os estados relevantes
  const updateClientesStatus = (clienteId: string, newStatus: string) => {
    // Atualizar o cliente na lista de clientes
    setClientes((prev) =>
      prev.map((c) => 
        c.id === clienteId ? { ...c, status: newStatus } : c
      )
    );
    
    // Atualizar o cliente na lista filtrada e na lista completa
    const updateClienteList = (clienteList: typeof clientesComPagamentos) => 
      clienteList.map((c) => 
        c.id === clienteId ? { ...c, status: newStatus } : c
      );
    
    setClientesComPagamentos(updateClienteList(clientesComPagamentos));
  };

  // Gerenciamento de status de pagamento
  const { submitting, handleChangeStatus } = usePaymentStatus(
    pagamentos, 
    setPagamentos,
    updateClientesStatus
  );

  return {
    filteredClientes,
    mesAtual,
    setMesAtual,
    anoAtual,
    setAnoAtual,
    searchTerm,
    setSearchTerm,
    loading,
    submitting,
    handleChangeStatus,
    handleLimparFiltro,
    meses,
    anos
  };
};
