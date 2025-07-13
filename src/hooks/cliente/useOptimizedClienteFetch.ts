
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Cliente } from "@/types";
import { SecureClienteService } from "@/services/secureClienteService";
import { deleteCliente } from "@/services/clienteService";
import { secureLog } from "@/utils/secureLogger";

export const useOptimizedClienteFetch = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      secureLog.clientOperation('fetch_clientes_optimized_start');
      
      const clientesData = await SecureClienteService.getAllClientesWithDecryptedData();
      
      secureLog.clientOperation('fetch_clientes_optimized_success', { count: clientesData.length });
      setClientes(clientesData);
    } catch (error) {
      secureLog.error("Erro ao buscar clientes", {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar a lista de clientes. Dados sensíveis estão protegidos por criptografia.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleExcluir = useCallback(async (clienteId: string): Promise<void> => {
    try {
      secureLog.clientOperation('delete_cliente_optimized_start', { cliente_id: clienteId });
      
      await deleteCliente(clienteId);
      
      // Atualizar a lista localmente
      setClientes(prev => prev.filter(cliente => cliente.id !== clienteId));
      
      secureLog.clientOperation('delete_cliente_optimized_success', { cliente_id: clienteId });
      
      toast({
        title: "Cliente excluído",
        description: "Cliente foi excluído com sucesso.",
      });
    } catch (error) {
      secureLog.error("Erro ao excluir cliente", {
        cliente_id: clienteId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast({
        title: "Erro ao excluir cliente",
        description: "Não foi possível excluir o cliente.",
        variant: "destructive",
      });
      throw error; // Re-throw para que o caller saiba que houve erro
    }
  }, [toast]);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return {
    clientes,
    loading,
    fetchClientes,
    handleExcluir,
    setClientes
  };
};
