
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Cliente } from "@/types";
import { usePaymentStatus } from "@/hooks/payments/usePaymentStatus";

export const usePaymentMatrixStatus = (clientes: Cliente[], anoAtual: number) => {
  const [pagamentosStatus, setPagamentosStatus] = useState<Record<string, string>>({});
  const { handleChangeStatus } = usePaymentStatus();

  // Buscar status de pagamentos para todos os clientes e meses
  useEffect(() => {
    const fetchPagamentos = async () => {
      try {
        const { data, error } = await supabase
          .from('pagamentos')
          .select('cliente_id, mes, ano, status')
          .eq('ano', anoAtual)
          .in('cliente_id', clientes.map(c => c.id));

        if (error) {
          console.error("Erro ao buscar pagamentos:", error);
          return;
        }

        const statusMap: Record<string, string> = {};
        data?.forEach(pagamento => {
          const key = `${pagamento.cliente_id}-${pagamento.mes}-${pagamento.ano}`;
          statusMap[key] = pagamento.status;
        });
        
        setPagamentosStatus(statusMap);
      } catch (error) {
        console.error("Erro ao buscar pagamentos:", error);
      }
    };

    if (clientes.length > 0) {
      fetchPagamentos();
    }
  }, [clientes, anoAtual]);

  // Configurar realtime para pagamentos
  useEffect(() => {
    const channel = supabase
      .channel('pagamentos-matriz-channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
        }, 
        (payload) => {
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            if (newRecord && 
                typeof newRecord.cliente_id === 'string' &&
                typeof newRecord.mes === 'number' &&
                typeof newRecord.ano === 'number' &&
                typeof newRecord.status === 'string' &&
                newRecord.ano === anoAtual) {
              
              const key = `${newRecord.cliente_id}-${newRecord.mes}-${newRecord.ano}`;
              setPagamentosStatus(prev => ({
                ...prev,
                [key]: newRecord.status
              }));
            }
          } else if (payload.eventType === 'DELETE') {
            if (oldRecord &&
                typeof oldRecord.cliente_id === 'string' &&
                typeof oldRecord.mes === 'number' &&
                typeof oldRecord.ano === 'number' &&
                oldRecord.ano === anoAtual) {
              
              const key = `${oldRecord.cliente_id}-${oldRecord.mes}-${oldRecord.ano}`;
              setPagamentosStatus(prev => {
                const newState = { ...prev };
                delete newState[key];
                return newState;
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [anoAtual]);

  const handlePaymentStatusChange = async (cliente: Cliente, mes: number, status: string) => {
    try {
      const clienteComPagamentos = {
        ...cliente,
        pagamentos: {}
      };
      
      await handleChangeStatus(
        clienteComPagamentos,
        mes,
        anoAtual,
        status
      );
    } catch (error) {
      console.error("Erro ao alterar status de pagamento:", error);
    }
  };

  const getStatusForClient = (clienteId: string, mes: number): string => {
    const key = `${clienteId}-${mes}-${anoAtual}`;
    return pagamentosStatus[key] || "nao_pago";
  };

  return {
    getStatusForClient,
    handlePaymentStatusChange
  };
};
