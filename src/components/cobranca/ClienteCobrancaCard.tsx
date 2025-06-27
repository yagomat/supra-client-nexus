
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Phone, 
  Calendar, 
  DollarSign, 
  Clock, 
  MessageCircle,
  ExternalLink 
} from "lucide-react";
import { FilaCobranca } from "@/services/cobrancaService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  formatarMensagemWhatsApp, 
  gerarLinkWhatsApp, 
  abrirWhatsApp,
  determinarTipoMensagem 
} from "@/utils/whatsappUtils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTemplatesPersonalizados } from "@/hooks/useTemplatesPersonalizados";

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
  const { templates } = useTemplatesPersonalizados();
  const [templateSelecionado, setTemplateSelecionado] = useState<string>("");
  
  const statusColor = cliente.cliente_status === 'ativo' ? 'bg-green-500' : 'bg-red-500';
  const diasText = cliente.dias_para_vencimento === 0 
    ? "Vence hoje" 
    : cliente.dias_para_vencimento > 0 
      ? `${cliente.dias_para_vencimento} dias para vencer`
      : `${Math.abs(cliente.dias_para_vencimento)} dias em atraso`;

  const statusPagamento = cliente.status_pagamento === 'pago' || cliente.status_pagamento === 'pago_confianca' 
    ? 'Pago' 
    : 'Pendente';

  const dataFormatada = format(new Date(cliente.data_proximo_pagamento), "dd/MM/yyyy", {
    locale: ptBR
  });

  const handleEnviarWhatsApp = () => {
    if (!templateSelecionado) return;
    
    const template = templates.find(t => t.tipo_mensagem === templateSelecionado);
    if (!template || !cliente.cliente_telefone) return;

    const mensagemFormatada = formatarMensagemWhatsApp(template.mensagem, cliente);
    const linkWhatsApp = gerarLinkWhatsApp(
      cliente.cliente_codigo_pais, 
      cliente.cliente_telefone, 
      mensagemFormatada
    );
    
    abrirWhatsApp(linkWhatsApp);
    onRegistrarCobranca(cliente.cliente_id, templateSelecionado);
  };

  const templatesDisponiveis = templates.map(template => ({
    value: template.tipo_mensagem,
    label: template.nome_template
  }));

  // Sugerir template baseado no status do pagamento
  const tipoSugerido = determinarTipoMensagem(cliente.dias_para_vencimento);
  const templatePadrao = templates.find(t => t.tipo_mensagem === tipoSugerido);

  return (
    <Card className="w-full mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{cliente.cliente_nome}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`text-white ${statusColor}`}
            >
              {cliente.cliente_status}
            </Badge>
            <Badge variant="outline">{cliente.cliente_servidor}</Badge>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Próximo pagamento: {dataFormatada} - {diasText}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span className="truncate">{cliente.cliente_telefone || "N/A"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Dia {cliente.dia_vencimento}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>R$ {cliente.valor_plano?.toFixed(2).replace('.', ',') || "0,00"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className={statusPagamento === 'Pago' ? 'text-green-600' : 'text-red-600'}>
              {statusPagamento}
            </span>
          </div>
        </div>

        {cliente.ultimo_aviso && (
          <div className="text-xs p-2 bg-muted rounded">
            <strong>Último aviso:</strong> {cliente.ultimo_aviso.replace('_', ' ')}
            {cliente.data_ultimo_aviso && (
              <span className="ml-2 text-muted-foreground">
                ({format(new Date(cliente.data_ultimo_aviso), "dd/MM/yyyy HH:mm", { locale: ptBR })})
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Select value={templateSelecionado} onValueChange={setTemplateSelecionado}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={
                templatePadrao ? `Sugerido: ${templatePadrao.nome_template}` : "Escolha um template"
              } />
            </SelectTrigger>
            <SelectContent>
              {templatePadrao && (
                <SelectItem value={templatePadrao.tipo_mensagem}>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">Sugerido</Badge>
                    {templatePadrao.nome_template}
                  </div>
                </SelectItem>
              )}
              {templatesDisponiveis
                .filter(t => t.value !== templatePadrao?.tipo_mensagem)
                .map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleEnviarWhatsApp}
            disabled={!templateSelecionado || !cliente.cliente_telefone || submitting}
            size="sm"
            className="px-3"
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
