
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {cliente.cliente_nome}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant="secondary" 
                className={`text-white ${statusColor}`}
              >
                {cliente.cliente_status}
              </Badge>
              <Badge variant="outline">
                {cliente.cliente_servidor}
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Próximo Pagamento</div>
            <div className="font-medium">{dataFormatada}</div>
            <div className={`text-sm ${
              cliente.dias_para_vencimento < 0 ? 'text-red-600' : 
              cliente.dias_para_vencimento === 0 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {diasText}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{cliente.cliente_telefone || "Não informado"}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>Dia {cliente.dia_vencimento}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>
              {cliente.valor_plano 
                ? `R$ ${cliente.valor_plano.toFixed(2).replace('.', ',')}` 
                : "Não informado"
              }
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={
              statusPagamento === 'Pago' ? 'text-green-600' : 'text-red-600'
            }>
              {statusPagamento}
            </span>
          </div>
        </div>

        {cliente.ultimo_aviso && (
          <div className="p-3 bg-muted rounded-md">
            <div className="text-sm">
              <span className="font-medium">Último aviso:</span> {cliente.ultimo_aviso.replace('_', ' ')}
            </div>
            {cliente.data_ultimo_aviso && (
              <div className="text-xs text-muted-foreground mt-1">
                {format(new Date(cliente.data_ultimo_aviso), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR
                })}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selecionar Template</label>
            <Select value={templateSelecionado} onValueChange={setTemplateSelecionado}>
              <SelectTrigger>
                <SelectValue placeholder={
                  templatePadrao ? `Sugerido: ${templatePadrao.nome_template}` : "Escolha um template"
                } />
              </SelectTrigger>
              <SelectContent>
                {templatePadrao && (
                  <>
                    <SelectItem value={templatePadrao.tipo_mensagem}>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Sugerido</Badge>
                        {templatePadrao.nome_template}
                      </div>
                    </SelectItem>
                  </>
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
          </div>

          <Button
            onClick={handleEnviarWhatsApp}
            disabled={!templateSelecionado || !cliente.cliente_telefone || submitting}
            className="w-full"
            size="sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            <ExternalLink className="w-4 h-4 mr-2" />
            Enviar WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
