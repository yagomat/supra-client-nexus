import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Cliente } from "@/types";
import { ClienteService } from "@/services/clienteService";
import { UnifiedClienteService } from "@/services/unifiedClienteService";
import { useOptimizedClienteFetch } from "./useOptimizedClienteFetch";
import { useOptimizedClienteFilters } from "./useOptimizedClienteFilters";
import { useClienteModals } from "./useClienteModals";

/**
 * Hook consolidado que gerencia todas as operações de clientes
 * Substitui a necessidade de múltiplos hooks separados
 */
export const useOptimizedClienteManager = () => {
  const { toast } = useToast();
  const [processingOperations, setProcessingOperations] = useState<Set<string>>(new Set());

  // Busca otimizada de clientes
  const { 
    clientes, 
    loading: fetchLoading, 
    fetchClientes, 
    handleExcluir: handleExcluirFromFetch,
    setClientes 
  } = useOptimizedClienteFetch();

  // Filtros otimizados
  const {
    filteredClientes,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    orderBy,
    handleOrderChange,
    handleLimparFiltros: resetFilters
  } = useOptimizedClienteFilters(clientes);

  // Modais de clientes
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

  // Estados avançados
  const [clientesWithStatus, setClientesWithStatus] = useState<ClienteWithPaymentStatus[]>([]);

  // Verificar se operação está sendo processada
  const isOperationProcessing = useCallback((operation: string) => {
    return processingOperations.has(operation);
  }, [processingOperations]);

  // Marcar operação como processando
  const setOperationProcessing = useCallback((operation: string, processing: boolean) => {
    setProcessingOperations(prev => {
      const newSet = new Set(prev);
      if (processing) {
        newSet.add(operation);
      } else {
        newSet.delete(operation);
      }
      return newSet;
    });
  }, []);

  // Buscar clientes com status calculado (funcionalidade avançada)
  const fetchClientesWithStatus = useCallback(async (status?: "todos" | "ativo" | "inativo") => {
    const operationId = `fetch-status-${Date.now()}`;
    
    try {
      setOperationProcessing(operationId, true);
      
      const result = await UnifiedClienteService.getClientesWithCalculatedStatus(status);
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
    } finally {
      setOperationProcessing(operationId, false);
    }
  }, [setClientes, toast, setOperationProcessing]);

  // Criar cliente otimizado
  const createCliente = useCallback(async (cliente: Omit<Cliente, "id" | "created_at" | "status">) => {
    const operationId = `create-${Date.now()}`;
    
    try {
      setOperationProcessing(operationId, true);
      
      const result = await ClienteService.createCliente(cliente);
      
      if (result.success && result.cliente) {
        // Atualizar lista local
        setClientes(prev => [result.cliente!, ...prev]);
        
        toast({
          title: "Cliente criado",
          description: "Cliente criado com sucesso.",
        });
        
        return result.cliente;
      } else {
        throw new Error(result.error || 'Erro ao criar cliente');
      }
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast({
        title: "Erro ao criar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setOperationProcessing(operationId, false);
    }
  }, [setClientes, toast, setOperationProcessing]);

  // Atualizar cliente otimizado
  const updateCliente = useCallback(async (id: string, cliente: Partial<Cliente>) => {
    const operationId = `update-${id}`;
    
    try {
      setOperationProcessing(operationId, true);
      
      const result = await ClienteService.updateCliente(id, cliente);
      
      if (result.success && result.cliente) {
        // Atualizar lista local
        setClientes(prev => prev.map(c => c.id === id ? result.cliente! : c));
        
        toast({
          title: "Cliente atualizado",
          description: "Cliente atualizado com sucesso.",
        });
        
        return result.cliente;
      } else {
        throw new Error(result.error || 'Erro ao atualizar cliente');
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setOperationProcessing(operationId, false);
    }
  }, [setClientes, toast, setOperationProcessing]);

  // Pesquisar clientes otimizado
  const searchClientes = useCallback(async (searchTerm: string, status?: "todos" | "ativo" | "inativo") => {
    const operationId = `search-${searchTerm}`;
    
    try {
      setOperationProcessing(operationId, true);
      
      const result = await UnifiedClienteService.searchClientes(searchTerm, status);
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
    } finally {
      setOperationProcessing(operationId, false);
    }
  }, [setClientes, toast, setOperationProcessing]);

  // Verificar rate limit
  const checkRateLimit = useCallback(async (operation: string) => {
    try {
      return await UnifiedClienteService.checkOperationRateLimit(operation);
    } catch (error) {
      console.error(`Erro ao verificar rate limit para ${operation}:`, error);
      return false;
    }
  }, []);

  // Calcular status de pagamento
  const calculatePaymentStatus = useCallback(async (clienteId: string) => {
    try {
      return await UnifiedClienteService.calculatePaymentStatus(clienteId);
    } catch (error) {
      console.error("Erro ao calcular status de pagamento:", error);
      return { type: 'no_info', days: 0 };
    }
  }, []);

  // Limpar filtros
  const handleLimparFiltros = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  // Excluir cliente
  const handleExcluir = useCallback(async () => {
    if (!clienteParaExcluir) return;
    
    try {
      const success = await handleExcluirFromFetch(clienteParaExcluir);
      if (success) {
        setClienteParaExcluir(null);
      }
      return success;
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      return false;
    }
  }, [clienteParaExcluir, handleExcluirFromFetch, setClienteParaExcluir]);

  return {
    // Estados principais
    clientes,
    filteredClientes,
    clientesWithStatus,
    loading: fetchLoading,
    
    // Filtros
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    orderBy,
    handleOrderChange,
    handleLimparFiltros,
    
    // Modais
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
    confirmarExclusao,
    
    // Operações CRUD
    fetchClientes,
    fetchClientesWithStatus,
    createCliente,
    updateCliente,
    searchClientes,
    handleExcluir,
    
    // Utilitários
    isOperationProcessing,
    checkRateLimit,
    calculatePaymentStatus
  };
};