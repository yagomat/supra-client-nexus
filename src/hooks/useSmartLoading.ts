import { useState, useCallback, useRef } from "react";

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

interface LoadingOperation {
  id: string;
  state: LoadingState;
  message?: string;
  startTime: number;
  progress?: number;
}

interface SmartLoadingOptions {
  showMinimumTime?: number; // Tempo mínimo para mostrar loading (evita flash)
  autoHideSuccessAfter?: number; // Auto-hide success state após X ms
  enableProgress?: boolean; // Habilitar tracking de progresso
}

export const useSmartLoading = (options: SmartLoadingOptions = {}) => {
  const {
    showMinimumTime = 300,
    autoHideSuccessAfter = 2000,
    enableProgress = false
  } = options;

  const [operations, setOperations] = useState<Map<string, LoadingOperation>>(new Map());
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const startLoading = useCallback((id: string, message?: string) => {
    setOperations(prev => {
      const newOps = new Map(prev);
      newOps.set(id, {
        id,
        state: 'loading',
        message,
        startTime: Date.now(),
        progress: enableProgress ? 0 : undefined
      });
      return newOps;
    });

    // Limpar timeout anterior se existir
    const existingTimeout = timeoutsRef.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
  }, [enableProgress]);

  const updateProgress = useCallback((id: string, progress: number, message?: string) => {
    if (!enableProgress) return;

    setOperations(prev => {
      const newOps = new Map(prev);
      const operation = newOps.get(id);
      if (operation && operation.state === 'loading') {
        newOps.set(id, {
          ...operation,
          progress: Math.max(0, Math.min(100, progress)),
          message: message || operation.message
        });
      }
      return newOps;
    });
  }, [enableProgress]);

  const finishLoading = useCallback((id: string, success: boolean = true, message?: string) => {
    setOperations(prev => {
      const newOps = new Map(prev);
      const operation = newOps.get(id);
      
      if (!operation) return prev;

      const elapsedTime = Date.now() - operation.startTime;
      const newState: LoadingState = success ? 'success' : 'error';
      
      const updatedOperation: LoadingOperation = {
        ...operation,
        state: newState,
        message,
        progress: enableProgress ? 100 : undefined
      };

      // Se não passou o tempo mínimo, atrasar a finalização
      if (elapsedTime < showMinimumTime) {
        const remainingTime = showMinimumTime - elapsedTime;
        
        const timeout = setTimeout(() => {
          setOperations(current => {
            const finalOps = new Map(current);
            finalOps.set(id, updatedOperation);
            return finalOps;
          });
          
          // Auto-hide success state
          if (success && autoHideSuccessAfter > 0) {
            const hideTimeout = setTimeout(() => {
              setOperations(current => {
                const hideOps = new Map(current);
                hideOps.delete(id);
                return hideOps;
              });
              timeoutsRef.current.delete(id);
            }, autoHideSuccessAfter);
            
            timeoutsRef.current.set(id, hideTimeout);
          }
        }, remainingTime);
        
        timeoutsRef.current.set(id, timeout);
      } else {
        newOps.set(id, updatedOperation);
        
        // Auto-hide success state
        if (success && autoHideSuccessAfter > 0) {
          const hideTimeout = setTimeout(() => {
            setOperations(current => {
              const hideOps = new Map(current);
              hideOps.delete(id);
              return hideOps;
            });
            timeoutsRef.current.delete(id);
          }, autoHideSuccessAfter);
          
          timeoutsRef.current.set(id, hideTimeout);
        }
      }
      
      return newOps;
    });
  }, [showMinimumTime, autoHideSuccessAfter, enableProgress]);

  const clearOperation = useCallback((id: string) => {
    // Limpar timeout se existir
    const existingTimeout = timeoutsRef.current.get(id);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutsRef.current.delete(id);
    }

    setOperations(prev => {
      const newOps = new Map(prev);
      newOps.delete(id);
      return newOps;
    });
  }, []);

  const clearAllOperations = useCallback(() => {
    // Limpar todos os timeouts
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
    
    setOperations(new Map());
  }, []);

  const getOperation = useCallback((id: string): LoadingOperation | undefined => {
    return operations.get(id);
  }, [operations]);

  const isLoading = useCallback((id?: string): boolean => {
    if (id) {
      const operation = operations.get(id);
      return operation?.state === 'loading' || false;
    }
    
    // Se não especificar ID, verificar se qualquer operação está loading
    return Array.from(operations.values()).some(op => op.state === 'loading');
  }, [operations]);

  const getLoadingMessage = useCallback((id: string): string | undefined => {
    return operations.get(id)?.message;
  }, [operations]);

  const getProgress = useCallback((id: string): number | undefined => {
    return operations.get(id)?.progress;
  }, [operations]);

  // Helper para operações síncronas com async/await
  const withLoading = useCallback(async <T>(
    id: string,
    operation: () => Promise<T>,
    loadingMessage?: string,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T> => {
    startLoading(id, loadingMessage);
    
    try {
      const result = await operation();
      finishLoading(id, true, successMessage);
      return result;
    } catch (error) {
      finishLoading(id, false, errorMessage || 'Erro na operação');
      throw error;
    }
  }, [startLoading, finishLoading]);

  return {
    startLoading,
    updateProgress,
    finishLoading,
    clearOperation,
    clearAllOperations,
    getOperation,
    isLoading,
    getLoadingMessage,
    getProgress,
    withLoading,
    operations: Array.from(operations.values()), // Para facilitar render em componentes
    hasAnyLoading: isLoading(),
    operationsCount: operations.size
  };
};