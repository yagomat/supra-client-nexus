
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Cliente } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { SecureClienteService } from "@/services/secureClienteService";

export const useOptimizedClienteFetch = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar todos os clientes usando o serviço seguro
  const fetchClientes = async () => {
    try {
      setLoading(true);
      
      // Usar o SecureClienteService diretamente para buscar clientes
      const clientesData = await SecureClienteService.getClientes();
      
      // Verificar se há IDs duplicados nos dados
      const ids = clientesData.map(c => c.id);
      const uniqueIds = new Set(ids);
      
      if (ids.length !== uniqueIds.size) {
        console.error("❌ IDs duplicados na base de dados:", ids.filter((id, index) => ids.indexOf(id) !== index));
        // Remover duplicados mantendo apenas o primeiro
        const uniqueClientes = clientesData.filter((cliente, index) => 
          clientesData.findIndex(c => c.id === cliente.id) === index
        );
        setClientes(uniqueClientes);
        console.log("🔧 Duplicados removidos:", clientesData.length - uniqueClientes.length);
      } else {
        setClientes(clientesData);
      }
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
      console.log("Tentando excluir cliente:", clienteParaExcluir);
      
      // Usar SecureClienteService para exclusão
      await SecureClienteService.deleteCliente(clienteParaExcluir);
      
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
