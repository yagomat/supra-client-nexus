
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ValoresPredefinidos } from "@/types";
import { updateValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { validateNumericValue, validatePlanoValue, validateTextValue } from "../utils/valueValidations";

export const useAddValue = (
  valoresPredefinidos: ValoresPredefinidos | null,
  setValoresPredefinidos: React.Dispatch<React.SetStateAction<ValoresPredefinidos | null>>
) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleAddValue = async (newValueOrNumber: string | number, activeTab: string) => {
    if (!valoresPredefinidos) return false;
    
    try {
      setSaving(true);
      
      const isNumeric = ["dias_vencimento"].includes(activeTab);
      const isPlano = activeTab === "valores_plano";
      
      if (isNumeric) {
        // Validação para valores numéricos
        const validationResult = validateNumericValue(newValueOrNumber, activeTab);
        if (!validationResult.isValid) return false;
        
        const currentValues = valoresPredefinidos[activeTab as keyof ValoresPredefinidos] as number[];
        const updatedValues = [...currentValues, validationResult.value!];
        
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
        // Para valores de plano
        const validationResult = validatePlanoValue(newValueOrNumber);
        if (!validationResult.isValid) return false;
        
        const valorPlano = validationResult.value!;
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
        const validationResult = validateTextValue(newValueOrNumber, activeTab);
        if (!validationResult.isValid) return false;
        
        const textValue = validationResult.value!;
        const currentValues = valoresPredefinidos[activeTab as keyof ValoresPredefinidos] as string[];
        const updatedValues = [...currentValues, textValue];
        
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

  return {
    saving,
    handleAddValue
  };
};
