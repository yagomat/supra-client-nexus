
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ValoresPredefinidos } from "@/types";
import { updateValoresPredefinidos } from "@/services/valoresPredefinidosService";

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
      
      const isNumeric = ["dias_vencimento"].includes(activeTab);
      const isPlano = activeTab === "valores_plano";
      
      // Process imported text
      const items = importText.split("\n").map((item) => item.trim()).filter((item) => item.length > 0);
      
      if (isNumeric) {
        // For numeric values (dias_vencimento)
        const numericValues: number[] = items.map((item) => {
          const num = parseFloat(item);
          if (isNaN(num)) {
            throw new Error(`Valor inválido: ${item}`);
          }
          
          // Validation for dia_vencimento
          if (activeTab === "dias_vencimento") {
            if (num < 1 || num > 31 || !Number.isInteger(num)) {
              throw new Error(`Dia de vencimento inválido (deve ser entre 1 e 31): ${item}`);
            }
            return Math.round(num);
          }
          
          return num;
        });
        
        // Remove duplicates and sort numerically
        const uniqueSorted = Array.from(new Set(numericValues)).sort((a, b) => a - b);
        
        // Update backend with the correct type
        await updateValoresPredefinidos(activeTab as keyof ValoresPredefinidos, uniqueSorted);
        
        // Update local state
        setValoresPredefinidos({
          ...valoresPredefinidos,
          [activeTab]: uniqueSorted,
        });
      } else {
        // For string values (ufs, servidores, valores_plano, etc.)
        // Validate value lengths
        for (const item of items) {
          if (activeTab === "ufs" && item.length > 2) {
            throw new Error(`UF inválida (máximo 2 caracteres): ${item}`);
          } else if (["servidores", "dispositivos_smart", "aplicativos"].includes(activeTab) && item.length > 25) {
            throw new Error(`Valor inválido (máximo 25 caracteres): ${item}`);
          } else if (isPlano && item.length > 4) {
            throw new Error(`Valor do plano inválido (máximo 4 caracteres): ${item}`);
          }
        }
        
        // Remove duplicates and sort alphabetically
        const uniqueSorted = Array.from(new Set(items)).sort();
        
        // Update backend with the correct type
        await updateValoresPredefinidos(activeTab as keyof ValoresPredefinidos, uniqueSorted);
        
        // Update local state
        setValoresPredefinidos({
          ...valoresPredefinidos,
          [activeTab]: uniqueSorted,
        });
      }
      
      toast({
        title: "Importação concluída",
        description: `Foram importados ${items.length} valores com sucesso.`,
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao importar valores", error);
      toast({
        title: "Erro ao importar valores",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao importar os valores. Verifique se o formato está correto.",
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
