
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getClientes } from "@/services/clienteService";
import { getPagamentos } from "@/services/pagamentoService";
import { Cliente, Pagamento, ClienteComPagamentos } from "@/types";
import { meses } from "./usePaymentFilters";
import { supabase } from "@/integrations/supabase/client";
import { enableRealtimeForTable } from "@/services/clientStatusService";

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
      // Usar a função getPagamentos com filtro por ano
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

  // Configurar realtime para as tabelas relevantes
  useEffect(() => {
    const setupRealtime = async () => {
      try {
        await enableRealtimeForTable('clientes');
        await enableRealtimeForTable('pagamentos');
      } catch (error) {
        console.error("Error enabling realtime:", error);
      }
    };
    
    setupRealtime();
  }, []);

  // Carregar clientes e pagamentos inicialmente e inscrever-se para atualizações em tempo real
  useEffect(() => {
    fetchData();
    
    // Inscrever-se para atualizações em tempo real dos pagamentos (um único canal para todos)
    const pagamentosChannel = supabase
      .channel('pagamentos-master-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
        }, 
        (payload) => {
          // Atualizar a lista de pagamentos localmente
          if (payload.eventType === 'INSERT') {
            setPagamentos(prev => [...prev, payload.new as Pagamento]);
            
            toast({
              title: "Novo pagamento registrado",
              description: `Pagamento registrado com sucesso.`,
            });
          } else if (payload.eventType === 'UPDATE') {
            setPagamentos(prev => prev.map(p => 
              p.id === payload.new.id ? payload.new as Pagamento : p
            ));
          }
        }
      )
      .subscribe();
      
    // Inscrever-se para atualizações em tempo real dos clientes (um único canal para todos)
    const clientesChannel = supabase
      .channel('clientes-master-channel')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'clientes',
        }, 
        (payload) => {
          // Atualizar o cliente no estado local
          setClientes(currentClientes => 
            currentClientes.map(cliente => 
              cliente.id === payload.new.id ? { ...cliente, ...payload.new } : cliente
            )
          );
          
          // Notificar sobre alterações de status
          if (payload.old.status !== payload.new.status) {
            toast({
              title: "Status do cliente atualizado",
              description: `Cliente "${payload.new.nome}" agora está ${payload.new.status === 'ativo' ? 'ativo' : 'inativo'}.`,
            });
          }
        }
      )
      .subscribe();
      
    // Cleanup subscription
    return () => {
      supabase.removeChannel(pagamentosChannel);
      supabase.removeChannel(clientesChannel);
    };
  }, [fetchData, toast]);

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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
