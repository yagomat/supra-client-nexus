
import { useState, useEffect, useCallback } from "react";
import { Cliente } from "@/types";
import { SecureClienteService } from "@/services/secureClienteService";
import { useOptimizedCacheWithCategories } from "@/hooks/useOptimizedCacheWithCategories";

interface PaymentStatusResult {
  type: 'overdue' | 'today' | 'upcoming' | 'no_info';
  days: number;
  lastPaymentDate?: string;
  nextDueDate?: string;
}

export const useBackendCalculatedDays = (cliente: Cliente) => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusResult>({
    type: 'no_info',
    days: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const cache = useOptimizedCacheWithCategories<PaymentStatusResult>({
    categories: {
      basic: { ttl: 2 * 60 * 1000, maxSize: 100 }, // 2min para status de pagamento
      sensitive: { ttl: 30 * 1000, maxSize: 50 }, // 30s para dados sensíveis 
      config: { ttl: 10 * 60 * 1000, maxSize: 20 } // 10min para config
    }
  });

  const calculateStatus = useCallback(async () => {
    if (!cliente.id) return;

    const cacheKey = `payment-status-${cliente.id}`;
    
    try {
      setLoading(true);
      setError(null);

      // Tentar obter do cache primeiro
      const cached = cache.getSensitive(cacheKey);
      if (cached) {
        setPaymentStatus(cached);
        setLoading(false);
        return;
      }

      // Stub calculation for now - would normally use backend function
      const statusResult: PaymentStatusResult = {
        type: 'no_info',
        days: 0
      };

      // Armazenar no cache
      cache.setSensitive(cacheKey, statusResult);
      setPaymentStatus(statusResult);
      
    } catch (err) {
      console.error(`Erro ao calcular status para cliente ${cliente.nome}:`, err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Fallback para status seguro
      setPaymentStatus({
        type: 'no_info',
        days: 0
      });
    } finally {
      setLoading(false);
    }
  }, [cliente.id, cliente.nome, cache]);

  // Recalcular quando cliente mudar
  useEffect(() => {
    calculateStatus();
  }, [calculateStatus]);

  // Invalidar cache quando dia de vencimento mudar
  useEffect(() => {
    const cacheKey = `payment-status-${cliente.id}`;
    cache.remove(cacheKey);
    calculateStatus();
  }, [cliente.dia_vencimento, cliente.status, cache, calculateStatus]);

  // Função para forçar recálculo (útil após mudanças de pagamento)
  const recalculate = useCallback(async () => {
    const cacheKey = `payment-status-${cliente.id}`;
    cache.remove(cacheKey);
    await calculateStatus();
  }, [cliente.id, cache, calculateStatus]);

  // Função para invalidar cache de todos os clientes
  const invalidateAllCache = useCallback(() => {
    cache.invalidateByPattern(/^payment-status-/, 'sensitive');
  }, [cache]);

  return {
    paymentStatus,
    loading,
    error,
    recalculate,
    invalidateAllCache,
    
    // Compatibilidade com o hook anterior
    type: paymentStatus.type,
    days: paymentStatus.days,
    lastPaymentDate: paymentStatus.lastPaymentDate,
    nextDueDate: paymentStatus.nextDueDate
  };
};
