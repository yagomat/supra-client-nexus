
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
    setFilteredClientes,
    handleLimparFiltro,
    sortOrder,
    setSortOrder,
    meses,
    anos
  } = usePaymentFilters(clientesComPagamentos);

  // Gerenciamento de status de pagamento
  // No longer need to pass pagamentos and setPagamentos
  const { submitting, handleChangeStatus } = usePaymentStatus();

  return {
    filteredClientes,
    setFilteredClientes,
    clientes,
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
    sortOrder,
    setSortOrder,
    meses,
    anos
  };
};
