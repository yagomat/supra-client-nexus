
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getClientes } from "@/services/clienteService";
import { getPagamentos, createPagamento, updatePagamento } from "@/services/pagamentoService";
import { Cliente, Pagamento, ClienteComPagamentos } from "@/types";

export const usePagamentos = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [clientesComPagamentos, setClientesComPagamentos] = useState<ClienteComPagamentos[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [filteredClientes, setFilteredClientes] = useState<ClienteComPagamentos[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

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

  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    // Processar clientes e pagamentos
    const clientesPagamentos = clientes.map((cliente) => {
      const clientePagamentos: Record<string, Pagamento | undefined> = {};
      
      // Inicializar todos os meses do ano atual
      meses.forEach((mes) => {
        const chave = `${mes.value}-${anoAtual}`;
        clientePagamentos[chave] = undefined;
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
    setFilteredClientes(clientesPagamentos);
  }, [clientes, pagamentos, anoAtual]);

  useEffect(() => {
    // Filtrar por termo de busca
    if (searchTerm.trim() === "") {
      setFilteredClientes(clientesComPagamentos);
    } else {
      const filtered = clientesComPagamentos.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cliente.telefone && cliente.telefone.includes(searchTerm)) ||
          (cliente.uf && cliente.uf.toLowerCase().includes(searchTerm.toLowerCase())) ||
          cliente.servidor.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientesComPagamentos]);

  const handleChangeStatus = async (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => {
    try {
      setSubmitting(true);
      
      const chave = `${mes}-${ano}`;
      const pagamentoExistente = cliente.pagamentos[chave];
      
      if (pagamentoExistente) {
        // Atualizar pagamento existente
        await updatePagamento(pagamentoExistente.id, status);
        
        // Atualizar estado local
        setPagamentos((prev) =>
          prev.map((p) => (p.id === pagamentoExistente.id ? { ...p, status } : p))
        );
        
        toast({
          title: "Status atualizado",
          description: `Pagamento de ${meses.find((m) => m.value === mes)?.label} atualizado com sucesso.`,
        });
      } else {
        // Criar novo pagamento
        const novoPagamento = {
          cliente_id: cliente.id,
          mes,
          ano,
          status,
          data_pagamento: status !== "nao_pago" ? new Date().toISOString() : null,
        };
        
        const pagamentoCriado = await createPagamento(novoPagamento);
        
        // Atualizar estado local
        setPagamentos((prev) => [...prev, pagamentoCriado]);
        
        toast({
          title: "Pagamento registrado",
          description: `Pagamento de ${meses.find((m) => m.value === mes)?.label} registrado com sucesso.`,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar status de pagamento", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do pagamento.",
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
    anos
  };
};
