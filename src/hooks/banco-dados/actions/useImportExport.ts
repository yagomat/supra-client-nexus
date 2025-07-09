
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ValoresPredefinidos } from "@/types";
import { ImportValoresPredefinidosResponse } from "@/types/supabase-responses";
import { importValoresPredefinidos } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";
import { supabase } from "@/integrations/supabase/client";

export const useImportExport = (
  valoresPredefinidos: ValoresPredefinidos | null,
  setValoresPredefinidos: React.Dispatch<React.SetStateAction<ValoresPredefinidos | null>>,
  refreshValoresPredefinidos: () => Promise<void>
) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleImport = async (importText: string, activeTab: string) => {
    if (!valoresPredefinidos) return false;
    
    try {
      setSaving(true);
      
      const items = importText.split("\n").map((item) => item.trim()).filter((item) => item.length > 0);
      const result = await importValoresPredefinidos(activeTab, items);
      const typedResult = result as unknown as ImportValoresPredefinidosResponse;
      
      if (!typedResult.success) {
        // Verificar se é erro de rate limiting
        if (typedResult.message?.includes('Limite de')) {
          toast({
            title: "Limite excedido",
            description: typedResult.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro na importação",
            description: `${typedResult.message} ${typedResult.valores_invalidos?.length ? `Valores inválidos: ${typedResult.valores_invalidos.join(", ")}` : ""}`,
            variant: "destructive",
          });
        }
        return false;
      }
      
      // Recarregar dados do servidor para manter ordenação correta
      await refreshValoresPredefinidos();
      
      toast({
        title: "Importação concluída",
        description: `Foram importados ${typedResult.importados} valores. ${typedResult.duplicados} duplicados, ${typedResult.invalidos} inválidos.`,
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao importar valores", error);
      toast({
        title: "Erro ao importar valores",
        description: "Ocorreu um erro ao importar os valores. Por favor, tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (activeTab: string) => {
    if (!valoresPredefinidos) return;
    
    try {
      const values = valoresPredefinidos[activeTab as keyof ValoresPredefinidos];
      
      // Registrar auditoria e verificar rate limiting no backend
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) {
        toast({
          title: "Erro de autenticação",
          description: "Usuário não autenticado",
          variant: "destructive",
        });
        return;
      }

      await supabase.rpc('log_valores_predefinidos_export', {
        p_user_id: currentUser.user.id,
        p_tipo: activeTab,
        p_count: values.length
      });

      const content = values.join("\n");
      
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Exportação concluída",
        description: `${values.length} valores foram exportados com sucesso.`,
      });
    } catch (error: any) {
      console.error("Erro ao exportar valores", error);
      
      // Verificar se é erro de rate limiting
      if (error.message?.includes('Limite de exportações excedido')) {
        toast({
          title: "Limite excedido",
          description: "Limite de exportações excedido. Tente novamente em alguns minutos.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro na exportação",
          description: "Ocorreu um erro ao exportar os valores. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  return {
    saving,
    handleImport,
    handleExport
  };
};
