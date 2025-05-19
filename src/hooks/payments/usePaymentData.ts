
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getClientes } from "@/services/clienteService";
import { getPagamentos } from "@/services/pagamentoService";
import { Cliente, Pagamento, ClienteComPagamentos } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Months list is moved outside the hook to avoid recursive references
export const mesesList = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export const usePaymentData = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [clientesComPagamentos, setClientesComPagamentos] = useState<ClienteComPagamentos[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());

  // Function to load data that can be called when needed
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const clientesData = await getClientes();
      // Use the getPagamentos function with year filter
      const pagamentosData = await getPagamentos(undefined, undefined, anoAtual);
      
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
  }, [toast, anoAtual]);

  // Load clients and payments initially
  useEffect(() => {
    fetchData();
    
    // Subscribe to real-time updates for payments
    const pagamentosChannel = supabase
      .channel('pagamentos-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
        }, 
        () => {
          // Reload data when there are changes
          fetchData();
        }
      )
      .subscribe();
      
    // Cleanup subscription
    return () => {
      supabase.removeChannel(pagamentosChannel);
    };
  }, [fetchData]);

  // Process clients and payments
  useEffect(() => {
    const clientesPagamentos = clientes.map((cliente) => {
      const clientePagamentos: Record<string, Pagamento> = {};
      
      // Initialize all months of the current year
      mesesList.forEach((mes) => {
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
      
      // Add existing payments
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
    reloadData: fetchData // Export the function to allow reloading data when needed
  };
};
