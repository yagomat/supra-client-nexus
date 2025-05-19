
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import { getClientes, updateCliente, deleteCliente } from "@/services/clienteService";
import { Cliente } from "@/types";
import { ClienteTable } from "@/components/clientes/ClienteTable";
import { ClienteFilters } from "@/components/clientes/ClienteFilters";
import { ClienteListHeader } from "@/components/clientes/ClienteListHeader";
import { ClienteModals } from "@/components/clientes/ClienteModals";
import { EmptyState } from "@/components/clientes/EmptyState";
import { LoadingState } from "@/components/clientes/LoadingState";
import { supabase } from "@/integrations/supabase/client";

const ListaClientes = () => {
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
  const navigate = useNavigate();

  // Buscar clientes baseado no filtro de status
  const fetchClientes = async () => {
    try {
      setLoading(true);
      // Usar a função getClientes com o filtro de status
      const data = await getClientes(statusFilter);
      setClientes(data);
      
      // Apply sorting to the fetched data
      const sortedData = [...data].sort((a, b) => {
        if (sortOrder === 'nome') {
          return a.nome.localeCompare(b.nome);
        } else {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
      
      setFilteredClientes(sortedData);
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
  }, [toast, statusFilter, sortOrder]);

  useEffect(() => {
    // Apply sorting and filtering
    let results = [...clientes];
    
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
    results.sort((a, b) => {
      if (sortOrder === 'nome') {
        return a.nome.localeCompare(b.nome);
      } else {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    
    setFilteredClientes(results);
  }, [searchTerm, clientes, sortOrder]);

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

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-4">
        <ClienteListHeader />

        <ClienteFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          handleLimparFiltros={handleLimparFiltros}
        />

        {loading ? (
          <LoadingState />
        ) : filteredClientes.length === 0 ? (
          <EmptyState />
        ) : (
          <ClienteTable 
            clientes={filteredClientes}
            verDetalhes={verDetalhes}
            verTelaAdicional={verTelaAdicional}
            verObservacoes={verObservacoes}
            confirmarExclusao={confirmarExclusao}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        )}
      </div>

      <ClienteModals 
        clienteDetalhes={clienteDetalhes}
        isViewModalOpen={isViewModalOpen}
        setIsViewModalOpen={setIsViewModalOpen}
        isTelaAdicionaModalOpen={isTelaAdicionaModalOpen}
        setIsTelaAdicionaModalOpen={setIsTelaAdicionaModalOpen}
        isObservacoesModalOpen={isObservacoesModalOpen}
        setIsObservacoesModalOpen={setIsObservacoesModalOpen}
        clienteParaExcluir={clienteParaExcluir}
        setClienteParaExcluir={setClienteParaExcluir}
        handleExcluir={handleExcluir}
      />
    </DashboardLayout>
  );
};

export default ListaClientes;
