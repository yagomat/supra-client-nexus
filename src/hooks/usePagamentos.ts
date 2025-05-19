
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClientePagamento, Pagamento } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { format, isValid, parse } from "date-fns";
import { clientStatusService } from "@/services/clientStatusService";

export const usePagamentos = () => {
  const [loading, setLoading] = useState(false);
  const [pagamentos, setPagamentos] = useState<ClientePagamento[]>([]);

  // Função para carregar pagamentos do mês atual
  const loadPagamentos = async (ano: number, mes: number, 
    plano?: string, status?: "ativo" | "inativo", search?: string) => {
    try {
      setLoading(true);

      let query = supabase
        .from('clientes')
        .select(`
          id, nome, telefone, plano, status,
          pagamentos:pagamentos!inner(
            id, cliente_id, mes, ano, valor, status, data_pagamento
          )
        `)
        .eq('pagamentos.mes', mes)
        .eq('pagamentos.ano', ano)
        .order('nome', { ascending: true });

      // Filtros adicionais
      if (plano) {
        query = query.eq('plano', plano);
      }

      if (status) {
        query = query.eq('status', status);
      }

      if (search) {
        query = query.ilike('nome', `%${search}%`);
      }

      const { data: clientesComPagamentos, error } = await query;

      if (error) {
        throw error;
      }

      if (clientesComPagamentos) {
        setPagamentos(clientesComPagamentos as ClientePagamento[]);
      }
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
      toast({
        title: "Erro ao carregar pagamentos",
        description: "Não foi possível carregar os pagamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar clientes sem pagamento no mês
  const loadClientesSemPagamento = async (ano: number, mes: number,
    plano?: string, status?: "ativo" | "inativo", search?: string) => {
    try {
      setLoading(true);

      // Primeiro, obtemos todos os clientes que correspondem aos filtros
      let queryClientes = supabase
        .from('clientes')
        .select('id, nome, telefone, plano, status')
        .order('nome', { ascending: true });

      if (plano) {
        queryClientes = queryClientes.eq('plano', plano);
      }

      if (status) {
        queryClientes = queryClientes.eq('status', status);
      }

      if (search) {
        queryClientes = queryClientes.ilike('nome', `%${search}%`);
      }

      const { data: todosClientes, error: errorClientes } = await queryClientes;

      if (errorClientes) {
        throw errorClientes;
      }

      if (!todosClientes || todosClientes.length === 0) {
        setPagamentos([]);
        return;
      }

      // Agora, obtemos todos os pagamentos para o mês e ano específicos
      const { data: pagamentosExistentes, error: errorPagamentos } = await supabase
        .from('pagamentos')
        .select('cliente_id')
        .eq('mes', mes)
        .eq('ano', ano);

      if (errorPagamentos) {
        throw errorPagamentos;
      }

      // Criamos um conjunto (Set) com os IDs dos clientes que já têm pagamentos
      const clientesComPagamento = new Set(
        pagamentosExistentes?.map((p) => p.cliente_id) || []
      );

      // Filtramos os clientes que não têm pagamentos
      const clientesSemPagamento = todosClientes.filter(
        (cliente) => !clientesComPagamento.has(cliente.id)
      );

      // Transformamos os clientes em objetos ClientePagamento sem pagamentos
      const result: ClientePagamento[] = clientesSemPagamento.map((cliente) => ({
        ...cliente,
        pagamentos: [],
      }));

      setPagamentos(result);
    } catch (error) {
      console.error("Erro ao carregar clientes sem pagamento:", error);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar os clientes sem pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar o status do pagamento
  const savePaymentStatus = async (
    cliente: ClientePagamento,
    ano: number,
    mes: number,
    status: string,
    valor?: number
  ) => {
    try {
      // Vamos criar ou atualizar o pagamento conforme necessário
      let pagamento: Pagamento = {
        cliente_id: cliente.id,
        ano,
        mes,
        status,
        valor: valor || 0,
      };

      if (cliente.pagamentos?.[0]?.id) {
        pagamento.id = cliente.pagamentos[0].id;
      }
      
      // Se tem ID, é um pagamento existente que precisa ser atualizado
      if (pagamento.id) {
        const { error } = await supabase
          .from("pagamentos")
          .update({
            status: pagamento.status,
            data_pagamento: 
              pagamento.status === "pago" || pagamento.status === "pago_confianca" 
                ? new Date().toISOString()
                : null
          })
          .eq("id", pagamento.id);

        if (error) throw error;
      } else {
        // Se não existe, crie um novo pagamento
        // Vai usar a nova função RPC handle_payment_status_update implementada no backend
        // que vai cuidar de criar ou atualizar e também de atualizar o status do cliente
        const { data, error } = await supabase.rpc(
          'handle_payment_status_update', 
          { 
            p_cliente_id: cliente.id, 
            p_ano: ano, 
            p_mes: mes, 
            p_status: status 
          }
        );
        
        if (error) {
          throw error;
        }
        
        if (data && typeof data === 'object' && 'pagamento' in data) {
          const pagamentoData = data.pagamento as any;
          pagamento.id = pagamentoData.id;
          pagamento.status = pagamentoData.status;
          pagamento.data_pagamento = pagamentoData.data_pagamento;
          
          // Atualizar status do cliente se ele tiver sido alterado
          if ('cliente_status' in data && data.cliente_status !== cliente.status) {
            cliente.status = data.cliente_status as 'ativo' | 'inativo';
          }
        }
      }

      // Atualizar a lista local
      setPagamentos(prev => {
        return prev.map(c => {
          if (c.id === cliente.id) {
            return {
              ...c,
              pagamentos: c.pagamentos?.length 
                ? [{ ...c.pagamentos[0], ...pagamento }] 
                : [pagamento]
            };
          }
          return c;
        });
      });

      toast({
        title: "Status atualizado",
        description: `O pagamento de ${cliente.nome} foi ${status === "pago" ? "confirmado" : status === "pago_confianca" ? "marcado como pago por confiança" : "marcado como não pago"}.`,
      });

      // Se o status do cliente precisar ser atualizado com base no pagamento
      if (status === "pago" || status === "pago_confianca") {
        try {
          await clientStatusService.updateClientStatus(cliente.id);
        } catch (error) {
          console.error("Erro ao atualizar status do cliente:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar status do pagamento:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o status do pagamento.",
        variant: "destructive",
      });
    }
  };

  // Função para recarregar os dados
  const reloadData = (
    ano: number, 
    mes: number, 
    plano?: string, 
    status?: "ativo" | "inativo", 
    search?: string,
    onlyWithoutPayment?: boolean
  ) => {
    if (onlyWithoutPayment) {
      return loadClientesSemPagamento(ano, mes, plano, status, search);
    } else {
      return loadPagamentos(ano, mes, plano, status, search);
    }
  };

  return {
    pagamentos,
    loading,
    loadPagamentos,
    loadClientesSemPagamento,
    savePaymentStatus,
    reloadData
  };
};
