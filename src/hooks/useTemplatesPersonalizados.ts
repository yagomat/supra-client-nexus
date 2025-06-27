
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllTemplates, 
  addTemplatePersonalizado, 
  deleteTemplatePersonalizado,
  TemplatePersonalizado 
} from "@/services/mensagensWhatsAppService";

export const useTemplatesPersonalizados = () => {
  const [templates, setTemplates] = useState<TemplatePersonalizado[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getAllTemplates();
      setTemplates(data);
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
      toast({
        title: "Erro ao carregar templates",
        description: "Não foi possível carregar os templates de mensagem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (nomeTemplate: string, mensagem: string) => {
    try {
      setSubmitting(true);
      await addTemplatePersonalizado(nomeTemplate, mensagem);
      
      toast({
        title: "Template criado",
        description: `Template "${nomeTemplate}" foi criado com sucesso.`,
      });
      
      await fetchTemplates();
    } catch (error) {
      console.error("Erro ao criar template:", error);
      toast({
        title: "Erro ao criar template",
        description: "Não foi possível criar o template personalizado.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTemplate = async (templateId: string, nomeTemplate: string) => {
    try {
      setSubmitting(true);
      await deleteTemplatePersonalizado(templateId);
      
      toast({
        title: "Template deletado",
        description: `Template "${nomeTemplate}" foi deletado com sucesso.`,
      });
      
      await fetchTemplates();
    } catch (error) {
      console.error("Erro ao deletar template:", error);
      toast({
        title: "Erro ao deletar template",
        description: "Não foi possível deletar o template.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    submitting,
    addTemplate,
    deleteTemplate,
    fetchTemplates
  };
};
