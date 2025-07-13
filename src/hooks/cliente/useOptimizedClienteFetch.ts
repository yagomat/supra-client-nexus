
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Cliente } from "@/types";
import { SecureClienteService } from "@/services/secureClienteService";
import { deleteCliente } from "@/services/clienteService";
import { logError } from "@/utils/errorHandler";

export const useOptimizedClienteFetch = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Buscando clientes com dados descriptografados...");
      
      const clientesData = await SecureClienteService.getAllClientesWithDecryptedData();
      
      console.log("Clientes carregados:", clientesData.length);
      setClientes(clientesData);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      logError(error, 'fetchClientes');
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
      await deleteCliente(clienteId);
      
      // Atualizar a lista localmente
      setClientes(prev => prev.filter(cliente => cliente.id !== clienteId));
      
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
