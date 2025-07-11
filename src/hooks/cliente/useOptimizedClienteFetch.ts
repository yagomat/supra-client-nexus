
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Cliente } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { ClienteService } from "@/services/clienteService";

export const useOptimizedClienteFetch = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar todos os clientes com otimizações
  const fetchClientes = async () => {
    try {
      setLoading(true);
      
      const clientesData = await ClienteService.getClientes();
      
      // Verificação otimizada de duplicados
      const uniqueClientes = clientesData.reduce((acc, cliente) => {
        if (!acc.find(c => c.id === cliente.id)) {
          acc.push(cliente);
        }
        return acc;
      }, [] as Cliente[]);
      
      if (clientesData.length !== uniqueClientes.length) {
        console.warn("🔧 Duplicados removidos:", clientesData.length - uniqueClientes.length);
      }
      
      setClientes(uniqueClientes);
    } catch (error) {
      console.error("Erro ao buscar clientes", error);
      toast({
        title: "Erro ao carregar clientes",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao buscar a lista de clientes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (clienteParaExcluir: string) => {
    try {
      const result = await ClienteService.deleteCliente(clienteParaExcluir);
      
      if (result.success) {
        // Atualizar localmente
        setClientes((prev) => prev.filter((cliente) => cliente.id !== clienteParaExcluir));
        
        toast({
          title: "Cliente excluído",
          description: result.message || "O cliente foi excluído com sucesso.",
        });
        
        return true;
      } else {
        toast({
          title: "Erro ao excluir cliente",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Erro ao excluir cliente", error);
      toast({
        title: "Erro ao excluir cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir o cliente.",
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
        async (payload) => {
          // Verificar se a mudança é de um cliente do usuário atual
          const { data: currentUser } = await supabase.auth.getUser();
          const userId = currentUser.user?.id;
          
          if (!userId) return;
          
          // Verificar se o cliente pertence ao usuário atual
          const clienteUserId = (payload.new as any)?.user_id || (payload.old as any)?.user_id;
          if (clienteUserId !== userId) return;
          
          // Atualizar localmente baseado no tipo de evento
          if (payload.eventType === 'INSERT') {
            setClientes(prev => {
              // Verificar se o cliente já existe antes de adicionar
              const exists = prev.some(cliente => cliente.id === payload.new.id);
              if (exists) {
                console.log("🔍 Cliente já existe na lista, não adicionando:", payload.new.id);
                return prev;
              }
              return [payload.new as Cliente, ...prev];
            });
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
