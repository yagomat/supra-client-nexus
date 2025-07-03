
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
  Trash2,
  CreditCard
} from "lucide-react";
import { Cliente } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ClienteStatusBadge } from "./ClienteStatusBadge";
import { formatPhoneNumber } from "./table/PhoneFormatter";
import { useNavigate } from "react-router-dom";

interface ClienteCardProps {
  cliente: Cliente;
  onVerDetalhes: (cliente: Cliente) => void;
  onConfirmarExclusao: (clienteId: string) => void;
  onRegistrarPagamento?: (cliente: Cliente) => void;
}

export const ClienteCard = ({ 
  cliente, 
  onVerDetalhes, 
  onConfirmarExclusao,
  onRegistrarPagamento
}: ClienteCardProps) => {
  const navigate = useNavigate();

  const dataFormatada = format(new Date(cliente.created_at), "dd/MM/yyyy", {
    locale: ptBR
  });

  const handleRegistrarPagamento = () => {
    if (onRegistrarPagamento) {
      onRegistrarPagamento(cliente);
    } else {
      // Navegar para a aba de pagamentos com o cliente pré-selecionado
      navigate('/pagamentos', { state: { clienteId: cliente.id } });
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

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleRegistrarPagamento}
            size="sm"
            className="flex-1"
            variant="default"
          >
            <CreditCard className="w-4 h-4 mr-1" />
            Pagamento
          </Button>

          <Button
            onClick={() => onVerDetalhes(cliente)}
            size="sm"
            className="flex-1"
            variant="outline"
          >
            <Eye className="w-4 h-4 mr-1" />
            Detalhes
          </Button>

          <Button
            onClick={() => navigate(`/clientes/editar/${cliente.id}`)}
            size="sm"
            className="flex-1"
            variant="outline"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Editar
          </Button>

          <Button
            onClick={() => onConfirmarExclusao(cliente.id)}
            size="sm"
            className="flex-1"
            variant="destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
