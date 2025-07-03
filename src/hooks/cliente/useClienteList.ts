
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getClientes, deleteCliente } from "@/services/clienteService";
import { Cliente } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { verificarLicencasCliente } from "@/services/clienteService/clienteLicencaService";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";

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
  const [orderBy, setOrderBy] = useState<ClienteOrderType>('data');
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
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    
    switch (orderBy) {
      case 'nome_asc':
        results.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'nome_desc':
        results.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'vencimento':
        results.sort((a, b) => {
          const calcularPrioridadeVencimento = (cliente: Cliente) => {
            if (cliente.status === 'inativo') {
              // Cliente inativo - calcular há quantos dias venceu (valor negativo = maior prioridade)
              const daysPastDue = currentDay - cliente.dia_vencimento;
              if (daysPastDue > 0) {
                return -daysPastDue; // Negativo para dar prioridade aos mais vencidos
              } else {
                // Venceu no mês passado
                const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
                const daysInLastMonth = lastMonth.getDate();
                const daysPastDueLastMonth = (daysInLastMonth - cliente.dia_vencimento) + currentDay;
                return -daysPastDueLastMonth;
              }
            } else {
              // Cliente ativo - calcular quando será o próximo vencimento
              if (currentDay > cliente.dia_vencimento) {
                // Próximo vencimento é no mês seguinte
                const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, cliente.dia_vencimento);
                const daysUntilNext = Math.ceil((nextMonth.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysUntilNext + 1000; // Somar 1000 para que ativos venham depois dos inativos
              } else {
                const daysUntilDue = cliente.dia_vencimento - currentDay;
                return daysUntilDue + 1000; // Somar 1000 para que ativos venham depois dos inativos
              }
            }
          };
          
          const prioridadeA = calcularPrioridadeVencimento(a);
          const prioridadeB = calcularPrioridadeVencimento(b);
          
          return prioridadeA - prioridadeB;
        });
        break;
      case 'data':
      default:
        results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
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
  }, [searchTerm, orderBy]);

  const handleOrderChange = (order: ClienteOrderType) => {
    setOrderBy(order);
  };

  const handleLimparFiltros = () => {
    setSearchTerm("");
    setStatusFilter("todos");
    setOrderBy('data');
  };

  const verDetalhes = async (cliente: Cliente) => {
    try {
      // Verificar licenças ao abrir detalhes
      const licencasResult = await verificarLicencasCliente(cliente.id);
      
      // Adicionar informações de licença ao cliente para exibição
      const clienteComLicencas = {
        ...cliente,
        licencaInfo: licencasResult
      };
      
      setClienteDetalhes(clienteComLicencas as any);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error("Erro ao verificar licenças:", error);
      // Se falhar a verificação de licenças, continua exibindo os detalhes normalmente
      setClienteDetalhes(cliente);
      setIsViewModalOpen(true);
    }
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
      setFilteredClientes((prev) => prev.filter((cliente) => cliente.id !== clienteParaExcluir));
      
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
