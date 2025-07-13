
import { useCallback } from "react";

export const useClienteActions = () => {
  const handleLimparFiltros = useCallback((resetFilters: () => void) => {
    resetFilters();
  }, []);

  const handleExcluir = useCallback(async (
    clienteParaExcluir: any,
    onExcluir: (clienteId: string) => Promise<void>,
    onClose: () => void
  ): Promise<boolean> => {
    if (!clienteParaExcluir) return false;

    try {
      await onExcluir(clienteParaExcluir);
      onClose();
      return true;
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      return false;
    }
  }, []);

  return {
    handleLimparFiltros,
    handleExcluir
  };
};
