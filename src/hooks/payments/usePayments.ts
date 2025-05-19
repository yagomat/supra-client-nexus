
import { usePaymentData } from './usePaymentData';
import { usePaymentFilters } from './usePaymentFilters';
import { usePaymentStatus } from './usePaymentStatus';

export const usePayments = () => {
  const { 
    pagamentos, 
    setPagamentos, 
    loading, 
    loadPagamentos, 
    loadClientesSemPagamento 
  } = usePaymentData();
  
  const { 
    mesAtual, 
    setMesAtual, 
    anoAtual, 
    setAnoAtual, 
    searchTerm, 
    setSearchTerm, 
    filteredClientes, 
    handleLimparFiltro, 
    meses, 
    anos 
  } = usePaymentFilters(pagamentos);
  
  const { 
    submitting, 
    handleChangeStatus: baseHandleChangeStatus 
  } = usePaymentStatus();

  // Function to handle status change - wrapper that passes setPagamentos
  const handleChangeStatus = async (cliente: any, mes: number, ano: number, status: string) => {
    await baseHandleChangeStatus(cliente, mes, ano, status, setPagamentos);
  };

  // Function to reload data
  const reloadData = (
    ano: number = anoAtual, 
    mes: number = mesAtual, 
    plano?: string, 
    status?: "ativo" | "inativo", 
    search?: string,
    onlyWithoutPayment?: boolean
  ) => {
    if (onlyWithoutPayment) {
      return loadClientesSemPagamento(ano, mes, plano, status, search);
    } else {
      return loadPagamentos(ano, mes, plano, status, search);
    }
  };

  return {
    pagamentos,
    filteredClientes,
    loading,
    submitting,
    mesAtual,
    setMesAtual,
    anoAtual,
    setAnoAtual,
    searchTerm, 
    setSearchTerm,
    meses,
    anos,
    loadPagamentos,
    loadClientesSemPagamento,
    handleLimparFiltro,
    handleChangeStatus,
    reloadData
  };
};
