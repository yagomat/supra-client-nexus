
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createPagamento, updatePagamento } from "@/services/pagamentoService";
import { ClienteComPagamentos, Pagamento } from "@/types";
import { meses } from "./usePaymentFilters";

export const usePaymentStatus = (
  pagamentos: Pagamento[],
  setPagamentos: (pagamentos: Pagamento[]) => void
) => {
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChangeStatus = async (cliente: ClienteComPagamentos, mes: number, ano: number, status: string) => {
    try {
      setSubmitting(true);
      
      const chave = `${mes}-${ano}`;
      const pagamentoExistente = cliente.pagamentos[chave];
      
      let updatedPagamento: Pagamento;
      
      if (pagamentoExistente) {
        // Atualizar pagamento existente
        updatedPagamento = await updatePagamento(pagamentoExistente.id, status);
        
        // Atualizar estado local dos pagamentos
        const updatedPagamentosArray = pagamentos.map((p) => 
          (p.id === pagamentoExistente.id ? updatedPagamento : p)
        );
        setPagamentos(updatedPagamentosArray);
        
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
        updatedPagamento = pagamentoCriado;
        
        // Atualizar estado local dos pagamentos
        const updatedPagamentosArray = [...pagamentos, pagamentoCriado];
        setPagamentos(updatedPagamentosArray);
        
        toast({
          title: "Pagamento registrado",
          description: `Pagamento de ${meses.find((m) => m.value === mes)?.label} registrado com sucesso.`,
        });
      }
      
      // O status do cliente agora é atualizado automaticamente pelo trigger no banco de dados
      // portanto não precisamos mais fazer isso manualmente aqui
      
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

  return {
    submitting,
    handleChangeStatus,
  };
};
