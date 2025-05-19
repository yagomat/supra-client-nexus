
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

  // Gerenciamento de status de pagamento - Agora sem a lógica de atualização de status do cliente
  const { submitting, handleChangeStatus } = usePaymentStatus(
    pagamentos, 
    setPagamentos
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
