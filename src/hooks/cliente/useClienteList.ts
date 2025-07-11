import { useOptimizedClienteFetch } from "./useOptimizedClienteFetch";
import { useOptimizedClienteFilters } from "./useOptimizedClienteFilters";
import { useClienteModals } from "./useClienteModals";
import { useClienteActions } from "./useClienteActions";

export const useClienteList = () => {
  const { 
    clientes, 
    loading, 
    fetchClientes, 
    handleExcluir: handleExcluirFromFetch,
    setClientes 
  } = useOptimizedClienteFetch();
  
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

  const onLimparFiltros = () => handleLimparFiltros(resetFilters);

  const onExcluir = () => handleExcluir(
    clienteParaExcluir,
    handleExcluirFromFetch,
    () => setClienteParaExcluir(null)
  );

  return {
    clientes,
    filteredClientes,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    clienteDetalhes,
    isViewModalOpen,
    setIsViewModalOpen,
    isTelaAdicionaModalOpen,
    setIsTelaAdicionaModalOpen,
    isObservacoesModalOpen,
    setIsObservacoesModalOpen,
    clienteParaExcluir,
    setClienteParaExcluir,
    orderBy,
    handleOrderChange,
    handleLimparFiltros: onLimparFiltros,
    verDetalhes,
    verTelaAdicional,
    verObservacoes,
    confirmarExclusao,
    handleExcluir: onExcluir,
    fetchClientes
  };
};