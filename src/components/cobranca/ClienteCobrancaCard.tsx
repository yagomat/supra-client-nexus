
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilaCobranca } from "@/services/cobrancaService";
import { TipoMensagem } from "@/services/mensagensWhatsAppService";
import { useMensagensWhatsApp } from "@/hooks/useMensagensWhatsApp";
import { formatarMensagemWhatsApp, gerarLinkWhatsApp, determinarTipoMensagem, abrirWhatsApp } from "@/utils/whatsappUtils";
import { MessageCircle, Phone, Calendar, DollarSign, Server, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClienteCobrancaCardProps {
  cliente: FilaCobranca;
  onRegistrarCobranca: (clienteId: string, tipoAviso: string) => Promise<void>;
  submitting: boolean;
}

export const ClienteCobrancaCard = ({ cliente, onRegistrarCobranca, submitting }: ClienteCobrancaCardProps) => {
  const { mensagens, loading: loadingMensagens } = useMensagensWhatsApp();
  const [tipoMensagem, setTipoMensagem] = useState<TipoMensagem>(determinarTipoMensagem(cliente.dias_para_vencimento));
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);

  const getStatusBadge = () => {
    if (cliente.status_pagamento === 'pago' || cliente.status_pagamento === 'pago_confianca') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Pago</Badge>;
    }
    
    if (cliente.dias_para_vencimento < 0) {
      return <Badge variant="destructive">Vencido há {Math.abs(cliente.dias_para_vencimento)} dias</Badge>;
    }
    
    if (cliente.dias_para_vencimento === 0) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Vence hoje</Badge>;
    }
    
    return <Badge variant="secondary">Vence em {cliente.dias_para_vencimento} dias</Badge>;
  };

  const handleEnviarWhatsApp = async () => {
    try {
      setEnviandoWhatsApp(true);

      // Validar telefone
      if (!cliente.cliente_telefone) {
        throw new Error("Cliente não possui telefone cadastrado");
      }

      // Buscar mensagem do tipo selecionado
      const mensagemTemplate = mensagens[tipoMensagem];
      if (!mensagemTemplate) {
        throw new Error("Mensagem não configurada para este tipo");
      }

      // Formatar mensagem com placeholders
      const mensagemFormatada = formatarMensagemWhatsApp(mensagemTemplate, cliente);

      // Gerar link do WhatsApp
      const linkWhatsApp = gerarLinkWhatsApp(
        cliente.cliente_codigo_pais || '+55',
        cliente.cliente_telefone,
        mensagemFormatada
      );

      // Registrar cobrança
      await onRegistrarCobranca(cliente.cliente_id, tipoMensagem);

      // Abrir WhatsApp
      abrirWhatsApp(linkWhatsApp);

    } catch (error) {
      console.error("Erro ao enviar WhatsApp:", error);
    } finally {
      setEnviandoWhatsApp(false);
    }
  };

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5" />
            {cliente.cliente_nome}
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{cliente.cliente_codigo_pais || '+55'} {cliente.cliente_telefone || 'Não informado'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <span>{cliente.cliente_servidor}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {format(new Date(cliente.data_proximo_pagamento), "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>R$ {cliente.valor_plano?.toFixed(2).replace('.', ',') || '0,00'}</span>
          </div>
        </div>

        {cliente.ultimo_aviso && (
          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
            Último aviso: {cliente.ultimo_aviso} em{' '}
            {cliente.data_ultimo_aviso ? 
              format(new Date(cliente.data_ultimo_aviso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) :
              'Data não informada'
            }
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Select 
            value={tipoMensagem} 
            onValueChange={(value: TipoMensagem) => setTipoMensagem(value)}
            disabled={loadingMensagens || submitting}
          >
            <SelectTrigger className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a_vencer">A Vencer</SelectItem>
              <SelectItem value="vence_hoje">Vence Hoje</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="pago">Pago</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleEnviarWhatsApp}
            disabled={submitting || enviandoWhatsApp || loadingMensagens || !cliente.cliente_telefone}
            className="bg-green-600 hover:bg-green-700"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {enviandoWhatsApp ? 'Enviando...' : 'Enviar WhatsApp'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
