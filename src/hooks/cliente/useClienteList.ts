
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getClientes, deleteCliente } from "@/services/clienteService";
import { Cliente } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useClienteList = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isTelaAdicionaModalOpen, setIsTelaAdicionaModalOpen] = useState(false);
  const [isObservacoesModalOpen, setIsObservacoesModalOpen] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'nome' | 'data'>('data');
  const { toast } = useToast();

  // Buscar clientes baseado no filtro de status
  const fetchClientes = async () => {
    try {
      setLoading(true);
      // Usar a função getClientes com o filtro de status
      const data = await getClientes(statusFilter);
      setClientes(data);
      applyFiltersAndSort(data);
    } catch (error) {
      console.error("Erro ao buscar clientes", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Ocorreu um erro ao buscar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to apply filters and sorting
  const applyFiltersAndSort = (clientesData: Cliente[]) => {
    let results = [...clientesData];
    
    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.telefone && cliente.telefone.includes(searchTerm)) ||
          (cliente.uf && cliente.uf.toLowerCase().includes(searchTerm.toLowerCase())) ||
          cliente.servidor.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.observacoes && cliente.observacoes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply sorting
    if (sortOrder === 'nome') {
      results.sort((a, b) => a.nome.localeCompare(b.nome));
    } else {
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    
    setFilteredClientes(results);
  };

  useEffect(() => {
    fetchClientes();
    
    // Inscrever-se para atualizações em tempo real dos clientes
    const clientesChannel = supabase
      .channel('clientes-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'clientes',
        }, 
        () => {
          // Recarregar dados quando houver alterações
          fetchClientes();
        }
      )
      .subscribe();
      
    // Cleanup subscription
    return () => {
      supabase.removeChannel(clientesChannel);
    };
  }, [statusFilter]);
  
  // Re-apply filters and sort when any of these dependencies change
  useEffect(() => {
    if (clientes.length > 0) {
      applyFiltersAndSort(clientes);
    }
  }, [searchTerm, sortOrder]);

  const handleSortChange = (order: 'nome' | 'data') => {
    setSortOrder(order);
  };

  const handleLimparFiltros = () => {
    setSearchTerm("");
    setStatusFilter("todos");
  };

  const verDetalhes = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setIsViewModalOpen(true);
  };

  const verTelaAdicional = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setIsTelaAdicionaModalOpen(true);
  };

  const verObservacoes = (cliente: Cliente) => {
    setClienteDetalhes(cliente);
    setIsObservacoesModalOpen(true);
  };

  const confirmarExclusao = (clienteId: string) => {
    setClienteParaExcluir(clienteId);
  };

  const handleExcluir = async () => {
    if (!clienteParaExcluir) return;

    try {
      await deleteCliente(clienteParaExcluir);
      
      // Atualizar a lista de clientes
      setClientes((prev) => prev.filter((cliente) => cliente.id !== clienteParaExcluir));
      
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir cliente", error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Ocorreu um erro ao excluir o cliente. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setClienteParaExcluir(null);
    }
  };

  return {
    clientes,
    filteredClientes,
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
    sortOrder,
    handleSortChange,
    handleLimparFiltros,
    verDetalhes,
    verTelaAdicional,
    verObservacoes,
    confirmarExclusao,
    handleExcluir,
  };
};
