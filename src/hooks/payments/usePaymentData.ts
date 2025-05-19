
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ClienteComPagamentos, Pagamento } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export const usePaymentData = () => {
  const [loading, setLoading] = useState(false);
  const [pagamentos, setPagamentos] = useState<ClienteComPagamentos[]>([]);
  const { toast } = useToast();

  // Function to load payments for a specific month and year
  const loadPagamentos = async (
    ano: number, 
    mes: number, 
    plano?: string, 
    status?: "ativo" | "inativo", 
    search?: string
  ) => {
    try {
      setLoading(true);

      let query = supabase
        .from('clientes')
        .select(`
          id, nome, telefone, plano, status, created_at, 
          uf, servidor, dia_vencimento, valor_plano,
          dispositivo_smart, aplicativo, usuario_aplicativo, 
          senha_aplicativo, data_licenca_aplicativo, possui_tela_adicional,
          dispositivo_smart_2, aplicativo_2, usuario_2, senha_2, 
          data_licenca_2, observacoes,
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
        // Type assertion to handle the type issues
        const validClientes = (clientesComPagamentos as any[]).map((cliente) => {
          // Transform the array of pagamentos into the expected object format
          const pagamentosObj: Record<string, Pagamento> = {};
          if (Array.isArray(cliente.pagamentos)) {
            cliente.pagamentos.forEach((pagamento: Pagamento) => {
              const key = `${pagamento.mes}-${pagamento.ano}`;
              pagamentosObj[key] = pagamento;
            });
          }
          
          return {
            ...cliente,
            pagamentos: pagamentosObj
          } as ClienteComPagamentos;
        });
        
        setPagamentos(validClientes);
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
  const loadClientesSemPagamento = async (
    ano: number, 
    mes: number,
    plano?: string, 
    status?: "ativo" | "inativo", 
    search?: string
  ) => {
    try {
      setLoading(true);

      // First, get all clients that match the filters with all fields needed for ClienteComPagamentos
      let queryClientes = supabase
        .from('clientes')
        .select('*')
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
      const result = clientesSemPagamento.map((cliente) => {
        // Create empty pagamentos object
        const pagamentosObj: Record<string, Pagamento> = {};
        
        // Create a properly typed ClienteComPagamentos object
        const clienteComPagamentos: ClienteComPagamentos = {
          ...cliente,
          pagamentos: pagamentosObj
        };
        
        return clienteComPagamentos;
      });

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

  return {
    pagamentos,
    setPagamentos,
    loading,
    loadPagamentos,
    loadClientesSemPagamento
  };
};
