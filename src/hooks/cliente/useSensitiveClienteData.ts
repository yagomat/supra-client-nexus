import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  ClientePaginatedService, 
  SensitiveClienteData 
} from "@/services/clientePaginatedService";

interface UseSensitiveClienteDataOptions {
  autoCache?: boolean;
}

export const useSensitiveClienteData = (options: UseSensitiveClienteDataOptions = {}) => {
  const { autoCache = true } = options;
  const { toast } = useToast();
  
  // Estados
  const [sensitiveData, setSensitiveData] = useState<Record<string, SensitiveClienteData>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  // Função para buscar dados sensíveis de um cliente específico
  const fetchSensitiveData = useCallback(async (clienteId: string): Promise<SensitiveClienteData | null> => {
    if (!clienteId) return null;
    
    // Se já temos os dados e cache está habilitado, retornar cache
    if (autoCache && sensitiveData[clienteId]) {
      return sensitiveData[clienteId];
    }
    
    try {
      setLoading(prev => ({ ...prev, [clienteId]: true }));
      setError(null);
      
      const data = await ClientePaginatedService.getClienteSensitiveData(clienteId);
      
      // Armazenar no estado
      setSensitiveData(prev => ({
        ...prev,
        [clienteId]: data
      }));
      
      return data;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar dados sensíveis";
      setError(errorMessage);
      
      toast({
        title: "Erro ao buscar dados sensíveis",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [clienteId]: false }));
    }
  }, [sensitiveData, autoCache, toast]);
  
  // Função para buscar múltiplos clientes (lazy loading)
  const fetchMultipleSensitiveData = useCallback(async (clienteIds: string[]): Promise<Record<string, SensitiveClienteData>> => {
    const results: Record<string, SensitiveClienteData> = {};
    
    // Processar em lotes para evitar sobrecarga
    const batchSize = 3;
    for (let i = 0; i < clienteIds.length; i += batchSize) {
      const batch = clienteIds.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (clienteId) => {
        const data = await fetchSensitiveData(clienteId);
        if (data) {
          results[clienteId] = data;
        }
      });
      
      await Promise.allSettled(batchPromises);
      
      // Pequeno delay entre lotes para não sobrecarregar
      if (i + batchSize < clienteIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }, [fetchSensitiveData]);
  
  // Função para obter senha específica (mais auditada)
  const getClientePassword = useCallback(async (clienteId: string, passwordType: 'primary' | 'secondary' = 'primary') => {
    try {
      const data = await fetchSensitiveData(clienteId);
      
      if (!data) return null;
      
      // Log específico para acesso a senhas
      await ClientePaginatedService.logSensitiveDataAccess(
        'password_access', 
        clienteId, 
        passwordType === 'primary' ? 'senha_aplicativo' : 'senha_2'
      );
      
      return passwordType === 'primary' ? data.senha_aplicativo : data.senha_2;
      
    } catch (err) {
      console.error('Erro ao buscar senha:', err);
      return null;
    }
  }, [fetchSensitiveData]);
  
  // Função para obter observações (auditada)
  const getClienteObservacoes = useCallback(async (clienteId: string) => {
    try {
      const data = await fetchSensitiveData(clienteId);
      
      if (!data) return null;
      
      // Log específico para acesso a observações
      await ClientePaginatedService.logSensitiveDataAccess(
        'observacoes_access', 
        clienteId, 
        'observacoes'
      );
      
      return data.observacoes;
      
    } catch (err) {
      console.error('Erro ao buscar observações:', err);
      return null;
    }
  }, [fetchSensitiveData]);
  
  // Limpar cache de um cliente específico
  const clearClienteCache = useCallback((clienteId: string) => {
    setSensitiveData(prev => {
      const newData = { ...prev };
      delete newData[clienteId];
      return newData;
    });
    
    ClientePaginatedService.clearClienteCache(clienteId);
  }, []);
  
  // Limpar todo o cache
  const clearAllCache = useCallback(() => {
    setSensitiveData({});
    setLoading({});
    setError(null);
    ClientePaginatedService.clearAllClientesCache();
  }, []);
  
  // Verificar se dados estão carregados
  const isDataLoaded = useCallback((clienteId: string) => {
    return !!sensitiveData[clienteId];
  }, [sensitiveData]);
  
  // Verificar se está carregando
  const isLoading = useCallback((clienteId: string) => {
    return !!loading[clienteId];
  }, [loading]);
  
  // Pré-carregar dados sensíveis (para otimização)
  const preloadSensitiveData = useCallback(async (clienteIds: string[]) => {
    // Filtrar apenas os que não estão em cache
    const notCached = clienteIds.filter(id => !sensitiveData[id]);
    
    if (notCached.length > 0) {
      await fetchMultipleSensitiveData(notCached);
    }
  }, [sensitiveData, fetchMultipleSensitiveData]);
  
  return {
    // Estados
    sensitiveData,
    loading,
    error,
    
    // Funções principais
    fetchSensitiveData,
    fetchMultipleSensitiveData,
    
    // Funções específicas auditadas
    getClientePassword,
    getClienteObservacoes,
    
    // Cache
    clearClienteCache,
    clearAllCache,
    preloadSensitiveData,
    
    // Utilitários
    isDataLoaded,
    isLoading
  };
};