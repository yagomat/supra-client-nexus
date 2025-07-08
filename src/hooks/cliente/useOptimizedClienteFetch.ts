
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { deleteCliente } from "@/services/clienteService";
import { Cliente } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useOptimizedClienteFetch = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar todos os clientes de uma vez (filtros serão aplicados no frontend)
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClientes(data || []);
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
      
      // Atualizar a lista de clientes localmente (otimização)
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
        (payload) => {
          // Atualizar localmente baseado no tipo de evento
          if (payload.eventType === 'INSERT') {
            setClientes(prev => [payload.new as Cliente, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setClientes(prev => prev.map(cliente => 
              cliente.id === payload.new.id ? payload.new as Cliente : cliente
            ));
          } else if (payload.eventType === 'DELETE') {
            setClientes(prev => prev.filter(cliente => cliente.id !== payload.old.id));
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(clientesChannel);
    };
  }, []);

  return {
    clientes,
    loading,
    fetchClientes,
    handleExcluir,
    setClientes
  };
};
