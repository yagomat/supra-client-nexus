import { useOptimizedClienteManager } from "./useOptimizedClienteManager";

/**
 * Hook simplificado que usa o manager consolidado
 * Mantém compatibilidade com código existente
 */
export const useClienteList = () => {
  return useOptimizedClienteManager();
};