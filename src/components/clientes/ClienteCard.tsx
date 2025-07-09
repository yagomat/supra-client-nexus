
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cliente } from "@/types";
import { ClienteStatusBadge } from "./ClienteStatusBadge";
import { ClienteInfoGrid } from "./ClienteInfoGrid";
import { ClienteActionButtons } from "./ClienteActionButtons";
import { WhatsAppTemplateModal } from "./WhatsAppTemplateModal";
import { PaymentStatusButton } from "@/components/pagamentos/PaymentStatusButton";
import { usePaymentStatus } from "@/hooks/payments/usePaymentStatus";
import { usePaymentHistory } from "@/hooks/cliente/usePaymentHistory";
import { supabase } from "@/integrations/supabase/client";

interface ClienteCardProps {
  cliente: Cliente;
  onVerDetalhes: (cliente: Cliente) => void;
  onConfirmarExclusao: (clienteId: string) => void;
  mesAtual: number;
  anoAtual: number;
}

export const ClienteCard = ({ 
  cliente, 
  onVerDetalhes, 
  onConfirmarExclusao,
  mesAtual,
  anoAtual
}: ClienteCardProps) => {
  const { handleChangeStatus } = usePaymentStatus();
  const { payments: allPayments, loading: paymentsLoading, refetch: refetchPayments } = usePaymentHistory(cliente.id);
  const [statusPagamento, setStatusPagamento] = useState("nao_pago");
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Buscar status de pagamento do mês atual
  useEffect(() => {
    const fetchCurrentMonthPaymentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('pagamentos')
          .select('status')
          .eq('cliente_id', cliente.id)
          .eq('mes', mesAtual)
          .eq('ano', anoAtual)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error("Erro ao buscar status de pagamento:", error);
          return;
        }

        setStatusPagamento(data?.status || "nao_pago");
      } catch (error) {
        console.error("Erro ao buscar status de pagamento:", error);
      }
    };

    fetchCurrentMonthPaymentStatus();

    // Configurar listener em tempo real para mudanças de pagamento
    const channel = supabase
      .channel(`pagamento-card-${cliente.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
          filter: `cliente_id=eq.${cliente.id}`
        }, 
        (payload) => {
          console.log('Payment change detected for card:', payload);
          const newRecord = payload.new as any;
          
          // Atualizar status se for do mês atual
          if (newRecord && 
              typeof newRecord.mes === 'number' &&
              typeof newRecord.ano === 'number' &&
              typeof newRecord.status === 'string' &&
              newRecord.mes === mesAtual && 
              newRecord.ano === anoAtual) {
            setStatusPagamento(newRecord.status);
          }
          
          // Recarregar status e histórico de pagamentos para garantir sincronização
          fetchCurrentMonthPaymentStatus();
          refetchPayments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [cliente.id, mesAtual, anoAtual, refetchPayments]);

  const handlePaymentStatusChange = async (status: string) => {
    try {
      const clienteComPagamentos = {
        ...cliente,
        pagamentos: {}
      };
      
      await handleChangeStatus(
        clienteComPagamentos,
        mesAtual,
        anoAtual,
        status
      );
    } catch (error) {
      console.error("Erro ao alterar status de pagamento:", error);
    }
  };

  const handleSendWhatsApp = (cliente: Cliente) => {
    setIsWhatsAppModalOpen(true);
  };

  if (paymentsLoading) {
    return (
      <Card className="w-full mb-4">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{cliente.nome}</CardTitle>
            <ClienteStatusBadge status={cliente.status || 'inativo'} />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <ClienteInfoGrid cliente={cliente} allPayments={allPayments} />

          <div className="flex gap-2 pt-2">
            <div className="flex-1">
              <PaymentStatusButton
                status={statusPagamento}
                onStatusChange={handlePaymentStatusChange}
                isList={true}
              />
            </div>

            <ClienteActionButtons
              cliente={cliente}
              onVerDetalhes={onVerDetalhes}
              onConfirmarExclusao={onConfirmarExclusao}
              onSendWhatsApp={handleSendWhatsApp}
            />
          </div>
        </CardContent>
      </Card>

      <WhatsAppTemplateModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        cliente={cliente}
      />
    </>
  );
};
