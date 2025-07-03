
import React from "react";
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
import { usePagamentos } from "@/hooks/usePagamentos";

interface ClienteCardProps {
  cliente: Cliente;
  onVerDetalhes: (cliente: Cliente) => void;
  onConfirmarExclusao: (clienteId: string) => void;
}

export const ClienteCard = ({ 
  cliente, 
  onVerDetalhes, 
  onConfirmarExclusao
}: ClienteCardProps) => {
  const navigate = useNavigate();
  const { handleChangeStatus } = usePaymentStatus();
  const isMobile = useIsMobile();
  
  // Usar o hook de pagamentos para obter dados atualizados
  const { filteredClientes, mesAtual, anoAtual } = usePagamentos();
  
  // Encontrar o cliente com dados de pagamento
  const clienteComPagamento = filteredClientes.find(c => c.id === cliente.id);
  
  // Obter o status de pagamento atual
  const chave = `${mesAtual}-${anoAtual}`;
  const pagamentoAtual = clienteComPagamento?.pagamentos[chave];
  const statusPagamento = pagamentoAtual?.status || "nao_pago";

  const dataFormatada = format(new Date(cliente.created_at), "dd/MM/yyyy", {
    locale: ptBR
  });

  const handlePaymentStatusChange = async (status: string) => {
    if (clienteComPagamento) {
      try {
        await handleChangeStatus(
          clienteComPagamento,
          mesAtual,
          anoAtual,
          status
        );
      } catch (error) {
        console.error("Erro ao alterar status de pagamento:", error);
      }
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
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
          <div className="flex items-center gap-1">
            <Server className="w-3 h-3" />
            <span className="truncate">{cliente.servidor}</span>
          </div>
        </div>

        <div className="text-sm space-y-1">
          <div><strong>Aplicativo:</strong> {cliente.aplicativo}</div>
          <div><strong>Dia Vencimento:</strong> {cliente.dia_vencimento}</div>
          {cliente.uf && <div><strong>UF:</strong> {cliente.uf}</div>}
        </div>

        <div className="space-y-2 pt-2">
          <div className="w-full">
            <PaymentStatusButton
              status={statusPagamento}
              onStatusChange={handlePaymentStatusChange}
              isList={true}
            />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={() => onVerDetalhes(cliente)}
              size="sm"
              variant="outline"
              className="w-full h-9 p-0"
            >
              <Eye className="w-4 h-4" />
              {!isMobile && <span className="ml-1 text-xs">Detalhes</span>}
            </Button>

            <Button
              onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
              size="sm"
              variant="outline"
              className="w-full h-9 p-0"
            >
              <Pencil className="w-4 h-4" />
              {!isMobile && <span className="ml-1 text-xs">Editar</span>}
            </Button>

            <Button
              onClick={() => onConfirmarExclusao(cliente.id)}
              size="sm"
              variant="destructive"
              className="w-full h-9 p-0"
            >
              <Trash2 className="w-4 h-4" />
              {!isMobile && <span className="ml-1 text-xs">Excluir</span>}
            </Button>

            <div className="w-full h-9"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
