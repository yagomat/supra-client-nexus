
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getClientes } from "@/services/clienteService";
import { getPagamentos } from "@/services/pagamentoService";
import { Cliente, Pagamento, ClienteComPagamentos } from "@/types";
import { meses } from "./usePaymentFilters";

export const useClientesPagamentos = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [clientesComPagamentos, setClientesComPagamentos] = useState<ClienteComPagamentos[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  // Função para carregar dados que pode ser chamada quando necessário
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const clientesData = await getClientes();
      const pagamentosData = await getPagamentos();
      
      setClientes(clientesData);
      setPagamentos(pagamentosData);
      
    } catch (error) {
      console.error("Erro ao buscar dados", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao buscar clientes e pagamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar clientes e pagamentos inicialmente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Processar clientes e pagamentos
  useEffect(() => {
    const clientesPagamentos = clientes.map((cliente) => {
      const clientePagamentos: Record<string, Pagamento> = {};
      
      // Inicializar todos os meses do ano atual
      meses.forEach((mes) => {
        const chave = `${mes.value}-${anoAtual}`;
        clientePagamentos[chave] = {
          id: "",
          cliente_id: cliente.id,
          mes: mes.value,
          ano: anoAtual,
          status: "nao_pago",
          data_pagamento: null,
          created_at: new Date().toISOString()
        };
      });
      
      // Adicionar pagamentos existentes
      pagamentos
        .filter((p) => p.cliente_id === cliente.id && p.ano === anoAtual)
        .forEach((pagamento) => {
          const chave = `${pagamento.mes}-${pagamento.ano}`;
          clientePagamentos[chave] = pagamento;
        });
      
      return {
        ...cliente,
        pagamentos: clientePagamentos,
      } as ClienteComPagamentos;
    });
    
    setClientesComPagamentos(clientesPagamentos);
  }, [clientes, pagamentos, anoAtual]);

  return {
    clientes,
    setClientes,
    pagamentos,
    setPagamentos,
    clientesComPagamentos,
    setClientesComPagamentos,
    loading,
    anoAtual,
    setAnoAtual,
    reloadData: fetchData // Exportar a função para permitir recarregar dados quando necessário
  };
};
