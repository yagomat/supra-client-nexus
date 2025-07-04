
import { useState } from "react";
import { useClienteFetch } from "./useClienteFetch";
import { useClienteFilters } from "./useClienteFilters";
import { useClienteModals } from "./useClienteModals";

export const useClienteList = () => {
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  
  const { 
    clientes, 
    loading, 
    fetchClientes, 
    handleExcluir: handleExcluirFromFetch,
    setClientes 
  } = useClienteFetch(statusFilter);
  
  const {
    filteredClientes,
    searchTerm,
    setSearchTerm,
    orderBy,
    handleOrderChange,
    handleLimparFiltros: handleLimparFiltrosFromFilters,
    setFilteredClientes
  } = useClienteFilters(clientes);

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

  const handleLimparFiltros = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    handleLimparFiltrosFromFilters();
  };

  const handleExcluir = async () => {
    if (!clienteParaExcluir) return;

    const success = await handleExcluirFromFetch(clienteParaExcluir);
    
    if (success) {
      // Atualizar a lista filtrada também
      setFilteredClientes((prev) => prev.filter((cliente) => cliente.id !== clienteParaExcluir));
    }
    
    setClienteParaExcluir(null);
  };

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
    handleLimparFiltros,
    verDetalhes,
    verTelaAdicional,
    verObservacoes,
    confirmarExclusao,
    handleExcluir,
    fetchClientes
  };
};
