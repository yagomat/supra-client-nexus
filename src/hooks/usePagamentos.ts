
import { useState, useEffect, useCallback } from "react";
import { Cliente, ClienteComPagamentos, Pagamento } from "@/types";
import { getClientes } from "@/services/clienteService";
import { getPagamentos, updatePagamento } from "@/services/pagamentoService";
import { useToast } from "./use-toast";
import { updateClienteStatus } from "@/services/clientStatusService";
import { meses } from "./payments/usePaymentFilters";

export const usePagamentos = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesComPagamentos, setClientesComPagamentos] = useState<ClienteComPagamentos[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteComPagamentos[]>([]);
  const [mesAtual, setMesAtual] = useState<number>(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState<number>(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Lista de anos para o filtro (ano atual - 2 até ano atual + 1)
  const anos = Array.from(
    { length: 4 },
    (_, i) => new Date().getFullYear() - 2 + i
  );
  
  // Função para carregar dados que pode ser chamada quando necessário
  const reloadData = useCallback(async () => {
    try {
      setLoading(true);
      const clientesData = await getClientes();
      const pagamentosData = await getPagamentos(undefined, mesAtual, anoAtual);
      
      // Processar dados para criar clientesComPagamentos
      const clientesPagamentos = clientesData.map((cliente) => {
        const pagamento = pagamentosData.find(
          (p) => 
            p.cliente_id === cliente.id && 
            p.mes === mesAtual && 
            p.ano === anoAtual
        );
        
        // Criar objeto de pagamentos para o cliente
        const pagamentosObj = {} as Record<string, Pagamento>;
        const chave = `${mesAtual}-${anoAtual}`;
        
        pagamentosObj[chave] = pagamento || {
          id: "",
          cliente_id: cliente.id,
          mes: mesAtual,
          ano: anoAtual,
          status: "nao_pago",
          data_pagamento: null,
          created_at: new Date().toISOString()
        };
        
        return {
          ...cliente,
          pagamentos: pagamentosObj,
        } as ClienteComPagamentos;
      });
      
      setClientes(clientesData);
      setClientesComPagamentos(clientesPagamentos);
      setFilteredClientes(clientesPagamentos);
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
  }, [mesAtual, anoAtual, toast]);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    reloadData();
  }, [reloadData]);
  
  // Efeito para filtrar clientes conforme pesquisa
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientesComPagamentos);
    } else {
      const filtered = clientesComPagamentos.filter((cliente) =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientesComPagamentos]);
  
  const handleChangeStatus = async (
    cliente: ClienteComPagamentos,
    mes: number,
    ano: number,
    status: string
  ) => {
    try {
      setSubmitting(true);
      const chave = `${mes}-${ano}`;
      const pagamento = cliente.pagamentos[chave];
      
      // Se o pagamento já existe (tem ID), atualize-o
      if (pagamento.id) {
        await updatePagamento(pagamento.id, status);
      } else {
        // Se não existe, crie um novo pagamento
        // Vai usar a nova função RPC handle_payment_status_update implementada no backend
        // que vai cuidar de criar ou atualizar e também de atualizar o status do cliente
        const { data } = await supabase.rpc(
          'handle_payment_status_update', 
          { 
            p_cliente_id: cliente.id, 
            p_mes: mes, 
            p_ano: ano, 
            p_status: status 
          }
        );
        
        if (data && data.pagamento) {
          pagamento.id = data.pagamento.id;
          pagamento.status = data.pagamento.status;
          pagamento.data_pagamento = data.pagamento.data_pagamento;
        }
      }
      
      // Atualizar o estado local do pagamento
      cliente.pagamentos[chave] = {
        ...pagamento,
        status,
        data_pagamento: status !== "nao_pago" ? new Date().toISOString() : null,
      };
      
      // Atualizar estado local dos clientes
      const updatedClientes = [...clientesComPagamentos];
      setClientesComPagamentos(updatedClientes);
      setFilteredClientes(
        searchTerm.trim() === "" 
          ? updatedClientes 
          : updatedClientes.filter((c) => 
              c.nome.toLowerCase().includes(searchTerm.toLowerCase())
            )
      );
      
      toast({
        title: "Pagamento atualizado",
        description: `O status do pagamento foi atualizado para ${status}.`,
      });
      
    } catch (error) {
      console.error("Erro ao atualizar pagamento", error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Não foi possível atualizar o status do pagamento.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleLimparFiltro = () => {
    setSearchTerm("");
  };
  
  return {
    filteredClientes,
    mesAtual,
    setMesAtual,
    anoAtual,
    setAnoAtual,
    searchTerm,
    setSearchTerm,
    loading,
    submitting,
    handleChangeStatus,
    handleLimparFiltro,
    meses,
    anos,
    reloadData
  };
};
