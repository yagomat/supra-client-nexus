
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Calendar, 
  DollarSign, 
  Server,
  Eye,
  Pencil,
  Trash2
} from "lucide-react";
import { Cliente } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClienteStatusBadge } from "./ClienteStatusBadge";
import { formatPhoneNumber } from "./table/PhoneFormatter";
import { PaymentStatusButton } from "@/components/pagamentos/PaymentStatusButton";
import { useNavigate } from "react-router-dom";
import { usePaymentStatus } from "@/hooks/payments/usePaymentStatus";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const navigate = useNavigate();
  const { handleChangeStatus } = usePaymentStatus();
  const isMobile = useIsMobile();
  const [statusPagamento, setStatusPagamento] = useState("nao_pago");

  // Calculate days based on payment status and client status
  const calculateDaysInfo = () => {
    const today = new Date();
    const currentDay = today.getDate();
    
    if (cliente.status === 'inativo') {
      // Cliente inativo - calcular há quantos dias venceu
      const daysPastDue = currentDay - cliente.dia_vencimento;
      if (daysPastDue > 0) {
        return { type: 'overdue', days: daysPastDue };
      } else if (daysPastDue === 0) {
        return { type: 'today', days: 0 };
      } else {
        // Se dia atual é menor que vencimento mas cliente está inativo,
        // significa que venceu no mês passado
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0);
        const daysInLastMonth = lastMonth.getDate();
        const daysPastDueLastMonth = (daysInLastMonth - cliente.dia_vencimento) + currentDay;
        return { type: 'overdue', days: daysPastDueLastMonth };
      }
    } else {
      // Cliente ativo - calcular quando será o próximo vencimento
      if (currentDay > cliente.dia_vencimento) {
        // Próximo vencimento é no mês seguinte
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, cliente.dia_vencimento);
        const daysUntilNext = Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { type: 'upcoming', days: daysUntilNext };
      } else if (currentDay === cliente.dia_vencimento) {
        return { type: 'today', days: 0 };
      } else {
        const daysUntilDue = cliente.dia_vencimento - currentDay;
        return { type: 'upcoming', days: daysUntilDue };
      }
    }
  };

  const formatDueInfo = () => {
    const dueInfo = calculateDaysInfo();
    
    if (dueInfo.type === 'overdue') {
      return `Venceu há ${dueInfo.days} dia${dueInfo.days > 1 ? 's' : ''}`;
    } else if (dueInfo.type === 'today') {
      return 'Vence hoje';
    } else {
      return `Vence em ${dueInfo.days} dia${dueInfo.days > 1 ? 's' : ''}`;
    }
  };

  // Buscar status de pagamento inicial e configurar listener em tempo real
  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('pagamentos')
          .select('status')
          .eq('cliente_id', cliente.id)
          .eq('mes', mesAtual)
          .eq('ano', anoAtual)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 é "not found"
          console.error("Erro ao buscar status de pagamento:", error);
          return;
        }

        setStatusPagamento(data?.status || "nao_pago");
      } catch (error) {
        console.error("Erro ao buscar status de pagamento:", error);
      }
    };

    fetchPaymentStatus();

    // Configurar listener em tempo real para este cliente específico
    const channel = supabase
      .channel(`pagamento-${cliente.id}-${mesAtual}-${anoAtual}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
          filter: `cliente_id=eq.${cliente.id}`
        }, 
        (payload) => {
          // Verificar se é para o mês/ano correto com verificações de tipo
          const newRecord = payload.new as any;
          if (newRecord && 
              typeof newRecord.mes === 'number' &&
              typeof newRecord.ano === 'number' &&
              typeof newRecord.status === 'string' &&
              newRecord.mes === mesAtual && 
              newRecord.ano === anoAtual) {
            setStatusPagamento(newRecord.status);
          }
        }
      )
      .subscribe();

    // Cleanup na desmontagem
    return () => {
      supabase.removeChannel(channel);
    };
  }, [cliente.id, mesAtual, anoAtual]);

  const handlePaymentStatusChange = async (status: string) => {
    try {
      // Criar um objeto cliente compatível com ClienteComPagamentos
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
      
      // O status será atualizado via realtime listener
    } catch (error) {
      console.error("Erro ao alterar status de pagamento:", error);
    }
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{cliente.nome}</CardTitle>
          <ClienteStatusBadge status={cliente.status || 'inativo'} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span className="truncate">{formatPhoneNumber(cliente.telefone) || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDueInfo()}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>R$ {cliente.valor_plano?.toFixed(2).replace('.', ',') || "0,00"}</span>
          </div>
          <div className="flex items-center gap-1 md:col-span-3">
            <Server className="w-3 h-3" />
            <span className="truncate">{cliente.servidor}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <div className="flex-1">
            <PaymentStatusButton
              status={statusPagamento}
              onStatusChange={handlePaymentStatusChange}
              isList={true}
            />
          </div>

          <Button
            onClick={() => onVerDetalhes(cliente)}
            size="sm"
            variant="outline"
            className="flex-1 min-w-0"
          >
            <Eye className="w-4 h-4" />
            {!isMobile && <span className="ml-1">Detalhes</span>}
          </Button>

          <Button
            onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
            size="sm"
            variant="outline"
            className="flex-1 min-w-0"
          >
            <Pencil className="w-4 h-4" />
            {!isMobile && <span className="ml-1">Editar</span>}
          </Button>

          <Button
            onClick={() => onConfirmarExclusao(cliente.id)}
            size="sm"
            variant="destructive"
            className="flex-1 min-w-0"
          >
            <Trash2 className="w-4 h-4" />
            {!isMobile && <span className="ml-1">Excluir</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
