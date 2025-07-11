import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Cliente, StatusFilterType } from "@/types";
import { UnifiedClienteService } from "@/services/clienteService.unified";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const useOptimizedClienteFetch = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar clientes com otimizações
  const fetchClientes = useCallback(async (status?: StatusFilterType) => {
    try {
      setLoading(true);
      const data = await UnifiedClienteService.getClientes(status);
      setClientes(data);
      logger.cliente("Clientes carregados", { count: data.length, status });
    } catch (error: any) {
      logger.error("Erro ao buscar clientes", "FETCH", error);
      toast({
        title: "Erro ao carregar clientes",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleExcluir = useCallback(async (id: string) => {
    try {
      const result = await UnifiedClienteService.deleteCliente(id);
      
      if (!result.success) {
        throw new Error(result.error || "Erro ao excluir cliente");
      }

      // Atualizar a lista local removendo o cliente excluído
      setClientes(prev => prev.filter(cliente => cliente.id !== id));

      logger.cliente("Cliente excluído", { clienteId: id });
      toast({
        title: "Cliente excluído",
        description: "Cliente foi excluído com sucesso.",
      });

      return true;
    } catch (error: any) {
      logger.error("Erro ao excluir cliente", "DELETE", error);
      toast({
        title: "Erro ao excluir cliente",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  // Configurar realtime apenas uma vez na inicialização
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
                logger.cliente("Cliente já existe na lista", { clienteId: payload.new.id });
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
  }, []); // Dependências vazias - executar apenas uma vez

  return {
    clientes,
    loading,
    fetchClientes,
    handleExcluir,
    setClientes
  };
};