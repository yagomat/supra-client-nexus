
import { useState } from "react";
import { useOptimizedClienteFetch } from "./useOptimizedClienteFetch";
import { useOptimizedClienteFilters } from "./useOptimizedClienteFilters";
import { useClienteModals } from "./useClienteModals";

export const useOptimizedClienteList = () => {
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
    handleLimparFiltros: handleLimparFiltrosFromFilters
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

  const handleLimparFiltros = () => {
    handleLimparFiltrosFromFilters();
  };

  const handleExcluir = async () => {
    if (!clienteParaExcluir) return;

    const success = await handleExcluirFromFetch(clienteParaExcluir);
    
    if (success) {
      // Não precisa atualizar filteredClientes pois é calculado automaticamente
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
