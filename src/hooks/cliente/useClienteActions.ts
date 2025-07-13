import { useCallback } from "react";

export const useClienteActions = () => {
  const handleLimparFiltros = useCallback((resetFilters: () => void) => {
    resetFilters();
  }, []);

  const handleExcluir = useCallback(async (
    clienteParaExcluir: any,
    onExcluir: (cliente: any) => Promise<boolean>,
    onClose: () => void
  ) => {
    if (!clienteParaExcluir) return;

    const success = await onExcluir(clienteParaExcluir);
    
    if (success) {
      // A lista será atualizada automaticamente via filtros reativos
    }
    
    onClose();
  }, []);

  return {
    handleLimparFiltros,
    handleExcluir
  };
};