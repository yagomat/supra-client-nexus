
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClienteComPagamentos, Pagamento } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { format, isValid, parse } from "date-fns";
import * as clientStatusService from "@/services/clientStatusService";

export const usePagamentos = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pagamentos, setPagamentos] = useState<ClienteComPagamentos[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  // Define arrays for filters
  const meses = [
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
  
  const anos = [2023, 2024, 2025, 2026, 2027];

  // Function to load payments for a specific month and year
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

      // Additional filters
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
        setPagamentos(clientesComPagamentos as ClienteComPagamentos[]);
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

  // Function to load clients without payment for the month
  const loadClientesSemPagamento = async (ano: number, mes: number,
    plano?: string, status?: "ativo" | "inativo", search?: string) => {
    try {
      setLoading(true);

      // First, get all clients that match the filters
      let queryClientes = supabase
        .from('clientes')
        .select('id, nome, telefone, status')
        .order('nome', { ascending: true });

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

      // Now, get all payments for the specific month and year
      const { data: pagamentosExistentes, error: errorPagamentos } = await supabase
        .from('pagamentos')
        .select('cliente_id')
        .eq('mes', mes)
        .eq('ano', ano);

      if (errorPagamentos) {
        throw errorPagamentos;
      }

      // Create a Set with IDs of clients that already have payments
      const clientesComPagamento = new Set(
        pagamentosExistentes?.map((p) => p.cliente_id) || []
      );

      // Filter clients that don't have payments
      const clientesSemPagamento = todosClientes.filter(
        (cliente) => !clientesComPagamento.has(cliente.id)
      );

      // Transform clients into ClienteComPagamentos objects without payments
      const result = clientesSemPagamento.map((cliente) => ({
        ...cliente,
        pagamentos: [],
      }));

      setPagamentos(result as ClienteComPagamentos[]);
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

  // Function to save payment status
  const savePaymentStatus = async (
    cliente: ClienteComPagamentos,
    ano: number,
    mes: number,
    status: string
  ) => {
    try {
      setSubmitting(true);
      
      // Create or update the payment as needed
      let pagamento: Partial<Pagamento> = {
        cliente_id: cliente.id,
        ano,
        mes,
        status,
      };

      if (cliente.pagamentos && cliente.pagamentos.length > 0) {
        pagamento.id = cliente.pagamentos[0].id;
      }
      
      // If it has an ID, it's an existing payment that needs to be updated
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
        // If it doesn't exist, create a new payment
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
        
        if (data) {
          const paymentData = data.pagamento;
          if (paymentData) {
            pagamento.id = paymentData.id;
            pagamento.status = paymentData.status;
            pagamento.data_pagamento = paymentData.data_pagamento;
          }
        }
      }

      // Update the local list
      setPagamentos(prev => 
        prev.map(c => {
          if (c.id === cliente.id) {
            return {
              ...c,
              pagamentos: c.pagamentos?.length 
                ? [{ ...c.pagamentos[0], ...pagamento } as Pagamento] 
                : [pagamento as Pagamento]
            };
          }
          return c;
        })
      );

      toast({
        title: "Status atualizado",
        description: `O pagamento de ${cliente.nome} foi ${status === "pago" ? "confirmado" : status === "pago_confianca" ? "marcado como pago por confiança" : "marcado como não pago"}.`,
      });

      // If client status needs to be updated based on the payment
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
    } finally {
      setSubmitting(false);
    }
  };
  
  // Filter clients based on search term
  const filteredClientes = searchTerm.trim() === ""
    ? pagamentos
    : pagamentos.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.telefone && cliente.telefone.includes(searchTerm))
      );
  
  // Function to clear search filter
  const handleLimparFiltro = () => {
    setSearchTerm("");
  };
  
  // Function to handle status change
  const handleChangeStatus = async (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => {
    await savePaymentStatus(cliente, ano, mes, status);
  };

  // Function to reload data
  const reloadData = (
    ano: number = anoAtual, 
    mes: number = mesAtual, 
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
    filteredClientes,
    loading,
    submitting,
    mesAtual,
    setMesAtual,
    anoAtual,
    setAnoAtual,
    searchTerm, 
    setSearchTerm,
    meses,
    anos,
    loadPagamentos,
    loadClientesSemPagamento,
    savePaymentStatus,
    handleLimparFiltro,
    handleChangeStatus,
    reloadData
  };
};
