
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";
import { Cliente } from "@/types";
import { useMensagensWhatsApp } from "@/hooks/useMensagensWhatsApp";
import { formatarMensagemWhatsAppComCliente, gerarLinkWhatsApp, abrirWhatsApp } from "@/utils/whatsappUtils";
import { useToast } from "@/components/ui/use-toast";
import { usePaymentHistory } from "@/hooks/cliente/usePaymentHistory";

interface WhatsAppTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
}

export const WhatsAppTemplateModal = ({
  isOpen,
  onClose,
  cliente,
}: WhatsAppTemplateModalProps) => {
  const { mensagens, loading } = useMensagensWhatsApp();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [customMessage, setCustomMessage] = useState<string>("");
  const { toast } = useToast();
  const { payments: allPayments } = usePaymentHistory(cliente.id);

  const tiposTemplate = [
    { key: 'a_vencer', label: 'A Vencer' },
    { key: 'vence_hoje', label: 'Vence Hoje' },
    { key: 'vencido', label: 'Vencido' },
    { key: 'pago', label: 'Pago' }
  ];

  const handleTemplateSelect = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    if (mensagens[templateKey as keyof typeof mensagens]) {
      // Usar a nova função que calcula corretamente os dados de vencimento
      const mensagemFormatada = formatarMensagemWhatsAppComCliente(
        mensagens[templateKey as keyof typeof mensagens],
        cliente,
        allPayments
      );
      setCustomMessage(mensagemFormatada);
    }
  };

  const handleSendMessage = () => {
    if (!customMessage.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, selecione um template ou digite uma mensagem.",
        variant: "destructive",
      });
      return;
    }

    if (!cliente.telefone) {
      toast({
        title: "Telefone não encontrado",
        description: "Este cliente não possui telefone cadastrado.",
        variant: "destructive",
      });
      return;
    }

    const codigoPais = cliente.codigo_pais_telefone || '+55';
    const linkWhatsApp = gerarLinkWhatsApp(codigoPais, cliente.telefone, customMessage);
    
    abrirWhatsApp(linkWhatsApp);
    
    toast({
      title: "WhatsApp aberto",
      description: `Mensagem preparada para ${cliente.nome}`,
    });

    onClose();
  };

  const handleClose = () => {
    setSelectedTemplate("");
    setCustomMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Enviar Mensagem WhatsApp
          </DialogTitle>
          <DialogDescription>
            Enviando mensagem para: <strong>{cliente.nome}</strong>
            {cliente.telefone && (
              <span className="block text-sm text-muted-foreground">
                Telefone: {cliente.telefone}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Selecionar Template</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {tiposTemplate.map((template) => (
                <Button
                  key={template.key}
                  variant={selectedTemplate === template.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTemplateSelect(template.key)}
                  disabled={loading}
                  className="justify-start"
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="custom-message" className="text-sm font-medium">
              Mensagem
            </Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Digite sua mensagem ou selecione um template acima"
              rows={6}
              className="mt-2"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSendMessage} className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Enviar WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
