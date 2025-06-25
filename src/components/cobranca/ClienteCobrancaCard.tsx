
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, DollarSign, Server } from "lucide-react";
import { FilaCobranca } from "@/services/cobrancaService";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClienteCobrancaCardProps {
  cliente: FilaCobranca;
  onRegistrarCobranca: (clienteId: string, tipoAviso: string) => void;
  submitting: boolean;
}

export const ClienteCobrancaCard = ({ 
  cliente, 
  onRegistrarCobranca, 
  submitting 
}: ClienteCobrancaCardProps) => {
  const getStatusBadge = () => {
    if (cliente.status_pagamento === 'pago' || cliente.status_pagamento === 'pago_confianca') {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Pago</Badge>;
    }
    
    if (cliente.dias_para_vencimento < 0) {
      return <Badge variant="destructive">Vencido há {Math.abs(cliente.dias_para_vencimento)} dias</Badge>;
    }
    
    if (cliente.dias_para_vencimento === 0) {
      return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Vence hoje</Badge>;
    }
    
    if (cliente.dias_para_vencimento <= 3) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Vence em {cliente.dias_para_vencimento} dias</Badge>;
    }
    
    return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Vence em {cliente.dias_para_vencimento} dias</Badge>;
  };

  const getUltimoAvisoInfo = () => {
    if (!cliente.ultimo_aviso || !cliente.data_ultimo_aviso) {
      return null;
    }

    const tipoAvisoLabels: Record<string, string> = {
      '3_dias': '3 dias',
      '1_dia': '1 dia',
      'hoje': 'hoje',
      'ontem': 'ontem',
      'renovado': 'renovado'
    };

    return (
      <div className="text-xs text-muted-foreground mt-2">
        Último aviso: {tipoAvisoLabels[cliente.ultimo_aviso]} - {formatDistanceToNow(new Date(cliente.data_ultimo_aviso), { 
          addSuffix: true, 
          locale: ptBR 
        })}
      </div>
    );
  };

  const isButtonDisabled = (tipo: string) => {
    return submitting || cliente.status_pagamento === 'pago' || cliente.status_pagamento === 'pago_confianca';
  };

  return (
    <Card className="w-full mb-3 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-sm">{cliente.cliente_nome}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Server className="w-3 h-3" />
              <span>{cliente.cliente_servidor}</span>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Dia {cliente.dia_vencimento}</span>
          </div>
          {cliente.valor_plano && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span>R$ {cliente.valor_plano.toFixed(2)}</span>
            </div>
          )}
          {cliente.cliente_telefone && (
            <div className="flex items-center gap-1 col-span-2">
              <Phone className="w-3 h-3" />
              <span>{cliente.cliente_telefone}</span>
            </div>
          )}
        </div>

        {getUltimoAvisoInfo()}

        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs h-8"
            onClick={() => onRegistrarCobranca(cliente.cliente_id, '3_dias')}
            disabled={isButtonDisabled('3_dias')}
          >
            3 dias
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs h-8"
            onClick={() => onRegistrarCobranca(cliente.cliente_id, '1_dia')}
            disabled={isButtonDisabled('1_dia')}
          >
            1 dia
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs h-8"
            onClick={() => onRegistrarCobranca(cliente.cliente_id, 'hoje')}
            disabled={isButtonDisabled('hoje')}
          >
            Hoje
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="text-xs h-8"
            onClick={() => onRegistrarCobranca(cliente.cliente_id, 'ontem')}
            disabled={isButtonDisabled('ontem')}
          >
            Ontem
          </Button>
          <Button 
            size="sm" 
            variant="default"
            className="text-xs h-8 col-span-2"
            onClick={() => onRegistrarCobranca(cliente.cliente_id, 'renovado')}
            disabled={isButtonDisabled('renovado')}
          >
            Renovado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
