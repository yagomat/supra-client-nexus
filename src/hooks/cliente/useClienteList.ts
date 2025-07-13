
import { useState, useEffect, useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Cliente } from "@/types";
import { SecureClienteService } from "@/services/secureClienteService";
import { useClienteModals } from "./useClienteModals";
import { useOptimizedClienteFilters } from "./useOptimizedClienteFilters";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { sortClientesByOrder } from "./clienteSortUtils";
import { logError } from "@/utils/errorHandler";

export const useClienteList = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderBy, setOrderBy] = useState<ClienteOrderType>("nome_asc");
  const { toast } = useToast();

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
    verDetalhes: baseVerDetalhes,
    verTelaAdicional: baseVerTelaAdicional,
    verObservacoes: baseVerObservacoes,
    confirmarExclusao
  } = useClienteModals();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredClientes,
    handleLimparFiltros
  } = useOptimizedClienteFilters(clientes);

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Buscando clientes com dados descriptografados...");
      
      // Usar SecureClienteService para buscar dados descriptografados
      const clientesData = await SecureClienteService.getAllClientesWithDecryptedData();
      
      console.log("Clientes carregados:", clientesData.length);
      setClientes(clientesData);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      logError(error, 'fetchClientes');
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleExcluir = useCallback(async (): Promise<void> => {
    if (!clienteParaExcluir) return;

    try {
      await SecureClienteService.deleteCliente(clienteParaExcluir);
      
      // Atualizar a lista localmente
      setClientes(prev => prev.filter(cliente => cliente.id !== clienteParaExcluir));
      setClienteParaExcluir(null);
      
      toast({
        title: "Cliente excluído",
        description: "Cliente foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      logError(error, 'handleExcluir');
      toast({
        title: "Erro ao excluir cliente",
        description: "Não foi possível excluir o cliente.",
        variant: "destructive",
      });
    }
  }, [clienteParaExcluir, toast]);

  // Versões das funções de visualização que garantem dados descriptografados
  const verDetalhes = useCallback(async (cliente: Cliente) => {
    try {
      console.log("Buscando detalhes descriptografados para cliente:", cliente.id);
      // Buscar dados descriptografados antes de abrir o modal
      const clienteDescriptografado = await SecureClienteService.getClienteWithDecryptedData(cliente.id);
      console.log("Cliente descriptografado:", clienteDescriptografado);
      baseVerDetalhes(clienteDescriptografado);
    } catch (error) {
      console.error("Erro ao buscar detalhes do cliente:", error);
      // Em caso de erro, usar os dados originais
      baseVerDetalhes(cliente);
      toast({
        title: "Aviso",
        description: "Alguns dados podem não estar disponíveis devido a problemas de descriptografia.",
        variant: "destructive",
      });
    }
  }, [baseVerDetalhes, toast]);

  const verTelaAdicional = useCallback(async (cliente: Cliente) => {
    try {
      console.log("Buscando dados da tela adicional para cliente:", cliente.id);
      const clienteDescriptografado = await SecureClienteService.getClienteWithDecryptedData(cliente.id);
      baseVerTelaAdicional(clienteDescriptografado);
    } catch (error) {
      console.error("Erro ao buscar dados da tela adicional:", error);
      baseVerTelaAdicional(cliente);
      toast({
        title: "Aviso",
        description: "Alguns dados podem não estar disponíveis devido a problemas de descriptografia.",
        variant: "destructive",
      });
    }
  }, [baseVerTelaAdicional, toast]);

  const verObservacoes = useCallback(async (cliente: Cliente) => {
    try {
      const clienteDescriptografado = await SecureClienteService.getClienteWithDecryptedData(cliente.id);
      baseVerObservacoes(clienteDescriptografado);
    } catch (error) {
      console.error("Erro ao buscar observações do cliente:", error);
      baseVerObservacoes(cliente);
    }
  }, [baseVerObservacoes]);

  const handleOrderChange = useCallback((newOrder: ClienteOrderType) => {
    setOrderBy(newOrder);
  }, []);

  // Aplicar ordenação aos clientes filtrados
  const sortedFilteredClientes = useMemo(() => {
    return sortClientesByOrder(filteredClientes, orderBy);
  }, [filteredClientes, orderBy]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return {
    clientes,
    filteredClientes: sortedFilteredClientes,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    clienteDetalhes,
    isViewModalOpen,
    setIsViewModalOpen,
    isTelaAdicionaModalOpen,
    setIsTelaAdicionaModalOpen,
    isObservacoesModalOpen,
    setIsObservacoesModalOpen,
    clienteParaExcluir,
    setClienteParaExcluir,
    orderBy,
    handleOrderChange,
    handleLimparFiltros,
    verDetalhes,
    verTelaAdicional,
    verObservacoes,
    confirmarExclusao,
    handleExcluir,
    fetchClientes
  };
};
