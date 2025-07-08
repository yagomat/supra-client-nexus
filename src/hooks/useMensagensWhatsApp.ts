import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  getMensagensWhatsApp, 
  updateMensagemWhatsApp, 
  TipoMensagem 
} from "@/services/mensagensWhatsApp";

export const useMensagensWhatsApp = () => {
  const [mensagens, setMensagens] = useState<Record<TipoMensagem, string>>({
    a_vencer: '',
    vence_hoje: '',
    vencido: '',
    pago: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchMensagens = async () => {
    try {
      setLoading(true);
      const data = await getMensagensWhatsApp();
      setMensagens(data);
    } catch (error) {
      console.error("Erro ao carregar mensagens WhatsApp:", error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Não foi possível carregar as mensagens do WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMensagem = async (tipo: TipoMensagem, mensagem: string) => {
    try {
      setSubmitting(true);
      await updateMensagemWhatsApp(tipo, mensagem);
      
      setMensagens(prev => ({
        ...prev,
        [tipo]: mensagem
      }));

      toast({
        title: "Template atualizado",
        description: `Template "${tipo.replace('_', ' ')}" foi atualizado com sucesso e registrado nos logs de auditoria.`,
      });
    } catch (error: any) {
      console.error("Erro ao atualizar template:", error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.message?.includes('Rate limit:')) {
        toast({
          title: "Limite excedido",
          description: "Muitas atualizações em pouco tempo. Aguarde alguns minutos.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Validação:')) {
        toast({
          title: "Erro de validação",
          description: error.message.replace('Validação: ', ''),
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao atualizar template",
          description: "Não foi possível atualizar o template. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchMensagens();
  }, []);

  return {
    mensagens,
    loading,
    submitting,
    updateMensagem,
    fetchMensagens
  };
};
