
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

  const dataFormatada = format(new Date(cliente.created_at), "dd/MM/yyyy", {
    locale: ptBR
  });

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
            <span>{dataFormatada}</span>
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
