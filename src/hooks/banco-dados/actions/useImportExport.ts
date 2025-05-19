
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ValoresPredefinidos } from "@/types";
import { importValoresPredefinidos } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";

export const useImportExport = (
  valoresPredefinidos: ValoresPredefinidos | null,
  setValoresPredefinidos: React.Dispatch<React.SetStateAction<ValoresPredefinidos | null>>
) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleImport = async (importText: string, activeTab: string) => {
    if (!valoresPredefinidos) return false;
    
    try {
      setSaving(true);
      
      const items = importText.split("\n").map((item) => item.trim()).filter((item) => item.length > 0);
      const result = await importValoresPredefinidos(activeTab, items);
      
      if (!result.success) {
        toast({
          title: "Erro na importação",
          description: `Nenhum valor foi importado. ${result.invalid_values?.length ? `Valores inválidos: ${result.invalid_values.join(", ")}` : ""}`,
          variant: "destructive",
        });
        return false;
      }
      
      // Recarregar valores predefinidos após importação
      await refreshValoresPredefinidos();
      
      toast({
        title: "Importação concluída",
        description: `Foram importados ${result.importados} valores. ${result.duplicados} duplicados, ${result.invalidos} inválidos.`,
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

  const handleExport = (activeTab: string) => {
    if (!valoresPredefinidos) return;
    
    const values = valoresPredefinidos[activeTab as keyof ValoresPredefinidos];
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
      description: `Os valores foram exportados com sucesso.`,
    });
  };

  return {
    saving,
    handleImport,
    handleExport
  };
};
