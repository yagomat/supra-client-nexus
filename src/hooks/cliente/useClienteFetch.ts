
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getClientes, deleteCliente } from "@/services/clienteService";
import { Cliente } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useClienteFetch = (statusFilter: "todos" | "ativo" | "inativo") => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar clientes baseado no filtro de status
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const data = await getClientes(statusFilter);
      setClientes(data);
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

  const handleExcluir = async (clienteParaExcluir: string) => {
    try {
      await deleteCliente(clienteParaExcluir);
      
      // Atualizar a lista de clientes
      setClientes((prev) => prev.filter((cliente) => cliente.id !== clienteParaExcluir));
      
      toast({
        title: "Cliente excluído",
        description: "O cliente foi excluído com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir cliente", error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Ocorreu um erro ao excluir o cliente. Por favor, tente novamente.",
        variant: "destructive",
      });
      return false;
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
  }, [statusFilter]);

  return {
    clientes,
    loading,
    fetchClientes,
    handleExcluir,
    setClientes
  };
};
