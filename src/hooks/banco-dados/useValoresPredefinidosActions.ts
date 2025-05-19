
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { updateValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";

export interface ValoresPredefinidosActionsProps {
  valoresPredefinidos: ValoresPredefinidos | null;
  setValoresPredefinidos: React.Dispatch<React.SetStateAction<ValoresPredefinidos | null>>;
}

export const useValoresPredefinidosActions = ({ 
  valoresPredefinidos, 
  setValoresPredefinidos 
}: ValoresPredefinidosActionsProps) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleAddValue = async (newValueOrNumber: string | number, activeTab: string) => {
    if (!valoresPredefinidos) return;
    
    try {
      setSaving(true);
      
      const isNumeric = ["dias_vencimento"].includes(activeTab);
      const isPlano = activeTab === "valores_plano";
      
      if (isNumeric) {
        if (typeof newValueOrNumber !== 'number') {
          toast({
            title: "Valor inválido",
            description: "Por favor, informe um valor numérico válido.",
            variant: "destructive",
          });
          return;
        }
        
        // Validation for dia_vencimento
        if (activeTab === "dias_vencimento") {
          if (newValueOrNumber < 1 || newValueOrNumber > 31 || !Number.isInteger(newValueOrNumber)) {
            toast({
              title: "Valor inválido",
              description: "O dia de vencimento deve ser um número inteiro entre 1 e 31.",
              variant: "destructive",
            });
            return;
          }
        }
        
        const currentValues = valoresPredefinidos[activeTab as keyof ValoresPredefinidos] as number[];
        const updatedValues = [...currentValues, newValueOrNumber];
        
        // Remove duplicates and sort
        const uniqueSorted = Array.from(new Set(updatedValues)).sort((a, b) => a - b);
        
        // Update backend with the correct numeric type
        await updateValoresPredefinidos(activeTab as keyof ValoresPredefinidos, uniqueSorted);
        
        // Update local state
        setValoresPredefinidos({
          ...valoresPredefinidos,
          [activeTab]: uniqueSorted,
        });
      } else if (isPlano) {
        // Para valores de plano, garantir que sejam tratados como números
        let valorPlano: number;
        
        if (typeof newValueOrNumber === 'string') {
          // Converter string para número de forma segura, aceitando formatos como "25,99"
          const normalizedValue = newValueOrNumber.replace(',', '.');
          valorPlano = parseFloat(normalizedValue);
          
          if (isNaN(valorPlano)) {
            toast({
              title: "Valor inválido",
              description: "O valor do plano deve ser um número válido.",
              variant: "destructive",
            });
            return;
          }
        } else if (typeof newValueOrNumber === 'number') {
          valorPlano = newValueOrNumber;
        } else {
          toast({
            title: "Valor inválido",
            description: "O valor do plano deve ser um número válido.",
            variant: "destructive",
          });
          return;
        }
        
        // Validar o valor do plano
        if (valorPlano <= 0) {
          toast({
            title: "Valor inválido",
            description: "O valor do plano deve ser maior que zero.",
            variant: "destructive",
          });
          return;
        }
        
        // Arredondar para duas casas decimais
        valorPlano = parseFloat(valorPlano.toFixed(2));
        
        const currentValues = valoresPredefinidos.valores_plano;
        const updatedValues = [...currentValues, valorPlano];
        
        // Remove duplicates and sort
        const uniqueSorted = Array.from(new Set(updatedValues)).sort((a, b) => a - b);
        
        // Update backend
        await updateValoresPredefinidos("valores_plano", uniqueSorted);
        
        // Update local state
        setValoresPredefinidos({
          ...valoresPredefinidos,
          valores_plano: uniqueSorted,
        });
      } else {
        // Para valores de texto
        if (typeof newValueOrNumber !== 'string') {
          toast({
            title: "Valor inválido",
            description: "Por favor, informe um valor de texto válido.",
            variant: "destructive",
          });
          return;
        }
        
        // Validations for text values
        if (activeTab === "ufs" && newValueOrNumber.length > 2) {
          toast({
            title: "UF inválida",
            description: "A UF deve ter no máximo 2 caracteres.",
            variant: "destructive",
          });
          return;
        } else if (["servidores", "dispositivos_smart", "aplicativos"].includes(activeTab) && newValueOrNumber.length > 25) {
          toast({
            title: "Valor inválido",
            description: "O valor deve ter no máximo 25 caracteres.",
            variant: "destructive",
          });
          return;
        }
        
        const currentValues = valoresPredefinidos[activeTab as keyof ValoresPredefinidos] as string[];
        const updatedValues = [...currentValues, newValueOrNumber];
        
        // Remove duplicates and sort
        const uniqueSorted = Array.from(new Set(updatedValues)).sort();
        
        // Update backend with the correct string type
        await updateValoresPredefinidos(activeTab as keyof ValoresPredefinidos, uniqueSorted);
        
        // Update local state
        setValoresPredefinidos({
          ...valoresPredefinidos,
          [activeTab]: uniqueSorted,
        });
      }
      
      toast({
        title: "Valor adicionado",
        description: "O valor foi adicionado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao adicionar valor", error);
      toast({
        title: "Erro ao adicionar valor",
        description: "Ocorreu um erro ao adicionar o valor. Por favor, tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteValue = async (type: string, value: string | number) => {
    if (!valoresPredefinidos) return false;
    
    try {
      setSaving(true);
      
      const isNumeric = ["dias_vencimento"].includes(type);
      const currentValues = valoresPredefinidos[type as keyof ValoresPredefinidos];
      
      let updatedValues = isNumeric
        ? (currentValues as number[]).filter((item) => item !== value)
        : (currentValues as string[]).filter((item) => item !== value);
      
      // Update backend
      await updateValoresPredefinidos(type as keyof ValoresPredefinidos, updatedValues);
      
      // Update local state
      setValoresPredefinidos({
        ...valoresPredefinidos,
        [type]: updatedValues,
      });
      
      toast({
        title: "Valor excluído",
        description: "O valor foi excluído com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir valor", error);
      toast({
        title: "Erro ao excluir valor",
        description: "Ocorreu um erro ao excluir o valor. Por favor, tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

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
    handleAddValue,
    handleDeleteValue,
    handleImport,
    handleExport,
  };
};
