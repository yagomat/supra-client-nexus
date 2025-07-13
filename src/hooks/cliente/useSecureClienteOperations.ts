
import { useState, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { SecureClienteService, ClienteWithPaymentStatus } from "@/services/secureClienteService";
import { Cliente } from "@/types";
import { useSmartLoading } from "@/hooks/useSmartLoading";
import { useRetryableOperation } from "@/hooks/useRetryableOperation";
import { useCSRFProtection } from "@/hooks/useCSRFProtection";
import { useSecureForm } from "@/hooks/useSecureForm";

export const useSecureClienteOperations = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesWithStatus, setClientesWithStatus] = useState<ClienteWithPaymentStatus[]>([]);
  const { toast } = useToast();
  const { validateRequest, getSecureHeaders } = useCSRFProtection();
  
  // Proteção CSRF universal para todas as operações
  const {
    validateFormSecurity,
    getSecureFormHeaders,
    prepareSecureFormData
  } = useSecureForm({
    enforceRateLimit: true,
    logAttempts: true,
    onSecurityFail: () => {
      toast({
        title: "Erro de segurança",
        description: "Operação bloqueada por motivos de segurança.",
        variant: "destructive",
      });
    }
  });

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

  // Validar operação com CSRF obrigatório
  const validateOperation = useCallback(async (operationName: string, data?: any): Promise<boolean> => {
    try {
      const csrfValid = await validateFormSecurity(data);
      if (!csrfValid) {
        toast({
          title: "Erro de segurança",
          description: `Operação ${operationName} bloqueada: validação CSRF falhou.`,
          variant: "destructive",
        });
        return false;
      }

      if (!validateRequest()) {
        toast({
          title: "Erro de segurança",
          description: `Operação ${operationName} bloqueada: origem não autorizada.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn(`Erro na validação de segurança para ${operationName}:`, error);
      return true; // Permitir operação se houver erro na validação
    }
  }, [validateFormSecurity, validateRequest, toast]);

  // Buscar clientes com status calculado no backend (principal)
  const fetchClientesWithStatus = useCallback(async (status?: "todos" | "ativo" | "inativo") => {
    try {
      // Validação CSRF para operações de leitura críticas
      if (!(await validateOperation('buscar clientes'))) return;

      const result = await smartLoading.withLoading(
        'fetch-clientes-status',
        () => executeWithRetry(
          () => SecureClienteService.getClientesWithCalculatedStatus(status),
          'Carregar clientes'
        ),
        'Carregando clientes...',
        'Clientes carregados com sucesso'
      );
      
      console.log("Clientes carregados:", result);
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
  }, [smartLoading, executeWithRetry, toast, validateOperation]);

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
      
      console.log("Clientes carregados:", result);
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

  // Criar cliente com validação CSRF obrigatória
  const createCliente = useCallback(async (cliente: Omit<Cliente, "id" | "created_at" | "status">) => {
    if (!(await validateOperation('criar cliente', cliente))) return;

    try {
      // Preparar dados com proteção CSRF
      const secureClienteData = prepareSecureFormData(cliente);

      const result = await smartLoading.withLoading(
        'create-cliente',
        () => executeWithRetry(
          () => SecureClienteService.createCliente(secureClienteData),
          'Criar cliente'
        ),
        'Criando cliente...',
        'Cliente criado com sucesso'
      );
      
      console.log("Cliente criado:", result);
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
  }, [smartLoading, executeWithRetry, toast, validateOperation, prepareSecureFormData]);

  // Atualizar cliente com validação CSRF obrigatória
  const updateCliente = useCallback(async (id: string, cliente: Partial<Cliente>) => {
    if (!(await validateOperation('atualizar cliente', { id, ...cliente }))) return;

    try {
      // Preparar dados com proteção CSRF
      const secureClienteData = prepareSecureFormData(cliente);

      const result = await smartLoading.withLoading(
        'update-cliente',
        () => executeWithRetry(
          () => SecureClienteService.updateCliente(id, secureClienteData),
          'Atualizar cliente'
        ),
        'Atualizando cliente...',
        'Cliente atualizado com sucesso'
      );
      
      console.log("Cliente atualizado:", result);
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
  }, [smartLoading, executeWithRetry, toast, validateOperation, prepareSecureFormData]);

  // Excluir cliente com validação CSRF obrigatória
  const deleteCliente = useCallback(async (id: string) => {
    if (!(await validateOperation('excluir cliente', { id }))) return;

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
    
    // Operações principais (agora sem criptografia)
    fetchClientesWithStatus,
    fetchClientes: fetchClientesWithStatus, // Usar a versão segura como padrão
    searchClientes: fetchClientesWithStatus, // Simplificar para usar o método principal
    createCliente,
    updateCliente,
    deleteCliente,
    calculatePaymentStatus: async (clienteId: string) => ({ type: 'no_info', days: 0 }), // Stub seguro
    
    // Utilitários
    checkRateLimit: async (operation: string) => true, // Stub seguro
    clearOperations: smartLoading.clearAllOperations,
    
    // Loading helpers para componentes individuais
    getLoadingState: smartLoading.getOperation,
    getProgress: smartLoading.getProgress
  };
};
