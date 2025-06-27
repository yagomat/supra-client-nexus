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
        title: "Mensagem atualizada",
        description: `Mensagem para "${tipo.replace('_', ' ')}" foi atualizada com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar mensagem:", error);
      toast({
        title: "Erro ao atualizar mensagem",
        description: "Não foi possível atualizar a mensagem.",
        variant: "destructive",
      });
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
