import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { SecureClienteService, ClienteWithPaymentStatus } from "@/services/secureClienteService";
import { Cliente } from "@/types";
import { useSmartLoading } from "@/hooks/useSmartLoading";
import { useRetryableOperation } from "@/hooks/useRetryableOperation";
import { useCSRFProtection } from "@/hooks/useCSRFProtection";

export const useSecureClienteOperations = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesWithStatus, setClientesWithStatus] = useState<ClienteWithPaymentStatus[]>([]);
  const { toast } = useToast();
  const { validateRequest, getSecureHeaders } = useCSRFProtection();
  const smartLoading = useSmartLoading({
    showMinimumTime: 300,
    autoHideSuccessAfter: 2000,
    enableProgress: true
  });
  const { executeWithRetry } = useRetryableOperation({
    maxRetries: 3,
    initialDelay: 1000,
    onRetry: (attempt, delay) => {
      toast({
        title: "Tentando novamente...",
        description: `Tentativa ${attempt} em ${Math.round(delay/1000)}s`,
      });
    }
  });

  // Validar operação antes de executar
  const validateOperation = useCallback((operationName: string): boolean => {
    if (!validateRequest()) {
      toast({
        title: "Erro de segurança",
        description: `Operação ${operationName} bloqueada: origem não autorizada.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [validateRequest, toast]);

  // Buscar clientes com status calculado no backend (principal)
  const fetchClientesWithStatus = useCallback(async (status?: "todos" | "ativo" | "inativo") => {
    try {
      const result = await smartLoading.withLoading(
        'fetch-clientes-status',
        () => executeWithRetry(
          () => SecureClienteService.getClientesWithCalculatedStatus(status),
          'Carregar clientes'
        ),
        'Carregando clientes...',
        'Clientes carregados com sucesso'
      );
      
      setClientesWithStatus(result);
      setClientes(result.map(item => item.cliente));
      return result;
    } catch (error) {
      console.error("Erro ao buscar clientes com status:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  }, [smartLoading, executeWithRetry, toast]);

  // Buscar clientes tradicionais (fallback)
  const fetchClientes = useCallback(async (status?: "todos" | "ativo" | "inativo") => {
    try {
      const result = await smartLoading.withLoading(
        'fetch-clientes',
        () => executeWithRetry(
          () => SecureClienteService.getClientes(status),
          'Carregar clientes'
        ),
        'Carregando clientes...',
        'Clientes carregados com sucesso'
      );
      
      setClientes(result);
      return result;
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  }, [smartLoading, executeWithRetry, toast]);

  // Criar cliente com validação CSRF
  const createCliente = useCallback(async (cliente: Omit<Cliente, "id" | "created_at" | "status">) => {
    if (!validateOperation('criar cliente')) return;

    try {
      const result = await smartLoading.withLoading(
        'create-cliente',
        () => executeWithRetry(
          () => SecureClienteService.createCliente(cliente),
          'Criar cliente'
        ),
        'Criando cliente...',
        'Cliente criado com sucesso'
      );
      
      // Atualizar lista local
      setClientes(prev => [...prev, result]);
      
      return result;
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast({
        title: "Erro ao criar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  }, [smartLoading, executeWithRetry, toast, validateOperation]);

  // Atualizar cliente com validação CSRF
  const updateCliente = useCallback(async (id: string, cliente: Partial<Cliente>) => {
    if (!validateOperation('atualizar cliente')) return;

    try {
      const result = await smartLoading.withLoading(
        'update-cliente',
        () => executeWithRetry(
          () => SecureClienteService.updateCliente(id, cliente),
          'Atualizar cliente'
        ),
        'Atualizando cliente...',
        'Cliente atualizado com sucesso'
      );
      
      // Atualizar lista local
      setClientes(prev => prev.map(c => c.id === id ? result : c));
      
      return result;
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  }, [smartLoading, executeWithRetry, toast, validateOperation]);

  // Excluir cliente com validação CSRF
  const deleteCliente = useCallback(async (id: string) => {
    if (!validateOperation('excluir cliente')) return;

    try {
      await smartLoading.withLoading(
        'delete-cliente',
        () => executeWithRetry(
          () => SecureClienteService.deleteCliente(id),
          'Excluir cliente'
        ),
        'Excluindo cliente...',
        'Cliente excluído com sucesso'
      );
      
      // Remover da lista local
      setClientes(prev => prev.filter(c => c.id !== id));
      setClientesWithStatus(prev => prev.filter(c => c.cliente.id !== id));
      
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro ao excluir cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  }, [smartLoading, executeWithRetry, toast, validateOperation]);

  // Pesquisar clientes com rate limiting
  const searchClientes = useCallback(async (searchTerm: string, status?: "todos" | "ativo" | "inativo") => {
    try {
      const result = await smartLoading.withLoading(
        'search-clientes',
        () => executeWithRetry(
          () => SecureClienteService.searchClientes(searchTerm, status),
          'Pesquisar clientes'
        ),
        'Pesquisando...',
        'Pesquisa concluída'
      );
      
      setClientes(result);
      return result;
    } catch (error) {
      console.error("Erro ao pesquisar clientes:", error);
      toast({
        title: "Erro na pesquisa",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  }, [smartLoading, executeWithRetry, toast]);

  // Calcular status de pagamento individual (backend)
  const calculatePaymentStatus = useCallback(async (clienteId: string) => {
    try {
      const result = await executeWithRetry(
        () => SecureClienteService.calculatePaymentStatus(clienteId),
        'Calcular status de pagamento'
      );
      
      return result;
    } catch (error) {
      console.error("Erro ao calcular status de pagamento:", error);
      return { type: 'no_info', days: 0 };
    }
  }, [executeWithRetry]);

  // Verificar rate limit para operação específica
  const checkRateLimit = useCallback(async (operation: string) => {
    try {
      return await SecureClienteService.checkOperationRateLimit(operation);
    } catch (error) {
      console.error(`Erro ao verificar rate limit para ${operation}:`, error);
      return false;
    }
  }, []);

    return {
    // Estados
    clientes,
    clientesWithStatus,
    
    // Loading states
    isLoading: smartLoading.isLoading,
    loading: smartLoading.hasAnyLoading,
    loadingOperations: smartLoading.operations,
    
    // Compatibilidade com hooks anteriores
    validationErrors: [],
    validationWarnings: [],
    validateCliente: async (_data: any) => ({ valid: true, errors: [], warnings: [] }),
    isDataValid: (_data: any) => true,
    clearValidationMessages: () => {},
    getAuditLogs: async (_eventType?: string) => [],
    
    // Operações principais
    fetchClientesWithStatus,
    fetchClientes,
    searchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    calculatePaymentStatus,
    
    // Utilitários
    checkRateLimit,
    clearOperations: smartLoading.clearAllOperations,
    
    // Loading helpers para componentes individuais
    getLoadingState: smartLoading.getOperation,
    getProgress: smartLoading.getProgress
  };
};
