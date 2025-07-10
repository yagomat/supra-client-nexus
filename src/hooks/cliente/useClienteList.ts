import { useOptimizedClienteFetch } from "./useOptimizedClienteFetch";
import { useOptimizedClienteFilters } from "./useOptimizedClienteFilters";
import { useClienteModals } from "./useClienteModals";
import { useClienteActions } from "./useClienteActions";
import { usePaginatedClientes } from "./usePaginatedClientes";
import { useSensitiveClienteData } from "./useSensitiveClienteData";

interface UseClienteListOptions {
  usePagination?: boolean;
  pageSize?: number;
}

export const useClienteList = (options: UseClienteListOptions = {}) => {
  const { usePagination = false, pageSize = 50 } = options;
  
  // Hook paginado (novo)
  const paginatedHook = usePaginatedClientes({
    initialLimit: pageSize,
    autoFetch: usePagination
  });
  
  // Hook original (compatibilidade)
  const originalHook = useOptimizedClienteFetch();
  
  // Usar hook paginado ou original baseado na opção
  const { 
    clientes, 
    loading, 
    fetchClientes, 
    handleExcluir: handleExcluirFromFetch,
    setClientes 
  } = usePagination ? {
    clientes: paginatedHook.clientes,
    loading: paginatedHook.loading,
    fetchClientes: paginatedHook.refresh,
    handleExcluir: originalHook.handleExcluir, // Manter funcionalidade original
    setClientes: originalHook.setClientes
  } : originalHook;
  
  const {
    filteredClientes,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    orderBy,
    handleOrderChange,
    handleLimparFiltros: resetFilters
  } = useOptimizedClienteFilters(clientes);

  const {
    clienteDetalhes,
    isViewModalOpen,
    setIsViewModalOpen,
    isTelaAdicionaModalOpen,
    setIsTelaAdicionaModalOpen,
    isObservacoesModalOpen,
    setIsObservacoesModalOpen,
    clienteParaExcluir,
    setClienteParaExcluir,
    verDetalhes,
    verTelaAdicional,
    verObservacoes,
    confirmarExclusao
  } = useClienteModals();

  const { handleLimparFiltros, handleExcluir } = useClienteActions();
  
  // Hook para dados sensíveis
  const sensitiveDataHook = useSensitiveClienteData();

  const onLimparFiltros = () => {
    if (usePagination) {
      paginatedHook.clearFilters();
    } else {
      handleLimparFiltros(resetFilters);
    }
  };

  const onExcluir = () => handleExcluir(
    clienteParaExcluir,
    handleExcluirFromFetch,
    () => setClienteParaExcluir(null)
  );
  
  // Função para buscar dados sensíveis sob demanda
  const fetchSensitiveData = async (clienteId: string) => {
    return await sensitiveDataHook.fetchSensitiveData(clienteId);
  };

  return {
    // Dados básicos
    clientes: usePagination ? paginatedHook.clientes : clientes,
    filteredClientes: usePagination ? paginatedHook.clientes : filteredClientes,
    loading,
    
    // Filtros (compatibilidade + paginação)
    searchTerm: usePagination ? paginatedHook.searchTerm : searchTerm,
    setSearchTerm: usePagination ? paginatedHook.handleSearch : setSearchTerm,
    statusFilter: usePagination ? paginatedHook.statusFilter : statusFilter,
    setStatusFilter: usePagination ? paginatedHook.handleStatusFilter : setStatusFilter,
    orderBy,
    handleOrderChange,
    handleLimparFiltros: onLimparFiltros,
    
    // Modais
    clienteDetalhes,
    isViewModalOpen,
    setIsViewModalOpen,
    isTelaAdicionaModalOpen,
    setIsTelaAdicionaModalOpen,
    isObservacoesModalOpen,
    setIsObservacoesModalOpen,
    clienteParaExcluir,
    setClienteParaExcluir,
    verDetalhes,
    verTelaAdicional,
    verObservacoes,
    confirmarExclusao,
    
    // Ações
    handleExcluir: onExcluir,
    fetchClientes,
    
    // Funcionalidades de paginação (quando habilitada)
    ...(usePagination && {
      paginationInfo: paginatedHook.paginationInfo,
      goToPage: paginatedHook.goToPage,
      goToNextPage: paginatedHook.goToNextPage,
      goToPrevPage: paginatedHook.goToPrevPage,
      goToFirstPage: paginatedHook.goToFirstPage,
      goToLastPage: paginatedHook.goToLastPage,
      handlePageSizeChange: paginatedHook.handlePageSizeChange,
    }),
    
    // Dados sensíveis
    fetchSensitiveData,
    getSensitiveData: sensitiveDataHook.sensitiveData,
    getClientePassword: sensitiveDataHook.getClientePassword,
    getClienteObservacoes: sensitiveDataHook.getClienteObservacoes,
    clearSensitiveCache: sensitiveDataHook.clearAllCache,
    
    // Configurações
    usePagination
  };
};