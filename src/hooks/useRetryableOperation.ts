import { useState, useCallback, useRef } from "react";

interface RetryableOperationOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any, attemptNumber: number) => boolean;
  onRetry?: (attemptNumber: number, nextDelay: number) => void;
  onMaxRetriesReached?: (error: any) => void;
}

interface RetryState {
  isRetrying: boolean;
  attemptNumber: number;
  nextRetryIn: number;
  lastError?: any;
  canCancel: boolean;
}

export const useRetryableOperation = (options: RetryableOperationOptions = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = (error: any, attemptNumber: number) => {
      // Retry para erros de rede, timeouts e rate limiting
      if (attemptNumber >= maxRetries) return false;
      
      const errorMessage = error?.message?.toLowerCase() || '';
      return (
        errorMessage.includes('network') ||
        errorMessage.includes('timeout') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('limite') ||
        error?.code === 'NETWORK_ERROR' ||
        error?.status === 429 ||
        error?.status === 503 ||
        error?.status === 502
      );
    },
    onRetry,
    onMaxRetriesReached
  } = options;

  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attemptNumber: 0,
    nextRetryIn: 0,
    canCancel: false
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const cancelledRef = useRef(false);

  const calculateDelay = useCallback((attemptNumber: number): number => {
    const delay = initialDelay * Math.pow(backoffFactor, attemptNumber - 1);
    return Math.min(delay, maxDelay);
  }, [initialDelay, backoffFactor, maxDelay]);

  const cancelRetry = useCallback(() => {
    cancelledRef.current = true;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    setRetryState({
      isRetrying: false,
      attemptNumber: 0,
      nextRetryIn: 0,
      canCancel: false
    });
  }, []);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Operação'
  ): Promise<T> => {
    let attemptNumber = 0;
    cancelledRef.current = false;

    const attempt = async (): Promise<T> => {
      attemptNumber++;
      
      try {
        const result = await operation();
        
        // Limpar estado de retry em caso de sucesso
        setRetryState({
          isRetrying: false,
          attemptNumber: 0,
          nextRetryIn: 0,
          canCancel: false
        });
        
        return result;
      } catch (error) {
        console.error(`${operationName} - Tentativa ${attemptNumber} falhou:`, error);
        
        // Verificar se foi cancelado
        if (cancelledRef.current) {
          throw new Error(`${operationName} cancelada pelo usuário`);
        }

        // Verificar se deve tentar novamente
        if (!shouldRetry(error, attemptNumber)) {
          if (attemptNumber >= maxRetries && onMaxRetriesReached) {
            onMaxRetriesReached(error);
          }
          
          setRetryState({
            isRetrying: false,
            attemptNumber: 0,
            nextRetryIn: 0,
            lastError: error,
            canCancel: false
          });
          
          throw error;
        }

        // Calcular delay para próxima tentativa
        const delay = calculateDelay(attemptNumber);
        
        setRetryState({
          isRetrying: true,
          attemptNumber,
          nextRetryIn: delay,
          lastError: error,
          canCancel: true
        });

        // Notificar sobre retry
        if (onRetry) {
          onRetry(attemptNumber, delay);
        }

        // Fazer countdown
        let remainingTime = delay;
        intervalRef.current = setInterval(() => {
          if (cancelledRef.current) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = undefined;
            }
            return;
          }

          remainingTime -= 100;
          setRetryState(prev => ({
            ...prev,
            nextRetryIn: Math.max(0, remainingTime)
          }));

          if (remainingTime <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = undefined;
            }
          }
        }, 100);

        // Aguardar delay antes da próxima tentativa
        await new Promise<void>((resolve, reject) => {
          timeoutRef.current = setTimeout(() => {
            if (cancelledRef.current) {
              reject(new Error(`${operationName} cancelada pelo usuário`));
            } else {
              resolve();
            }
          }, delay);
        });

        // Tentar novamente
        return attempt();
      }
    };

    return attempt();
  }, [shouldRetry, calculateDelay, maxRetries, onRetry, onMaxRetriesReached]);

  // Helper para criar operação retentável com configurações específicas
  const createRetryableOperation = useCallback(<T>(
    operation: () => Promise<T>,
    customOptions?: Partial<RetryableOperationOptions>
  ) => {
    const mergedOptions = { ...options, ...customOptions };
    
    return async (operationName?: string): Promise<T> => {
      const tempUseRetryable = useRetryableOperation(mergedOptions);
      return tempUseRetryable.executeWithRetry(operation, operationName);
    };
  }, [options]);

  // Helper para operações comuns com retry automático
  const withAutoRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string = 'Operação'
  ): Promise<T> => {
    return executeWithRetry(operation, operationName);
  }, [executeWithRetry]);

  return {
    retryState,
    executeWithRetry,
    cancelRetry,
    createRetryableOperation,
    withAutoRetry,
    isRetrying: retryState.isRetrying,
    canCancel: retryState.canCancel,
    attemptNumber: retryState.attemptNumber,
    nextRetryIn: retryState.nextRetryIn,
    lastError: retryState.lastError
  };
};