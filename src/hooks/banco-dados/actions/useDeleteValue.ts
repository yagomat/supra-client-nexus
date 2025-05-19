
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ValoresPredefinidos } from "@/types";
import { updateValoresPredefinidos } from "@/services/valoresPredefinidosService";

export const useDeleteValue = (
  valoresPredefinidos: ValoresPredefinidos | null,
  setValoresPredefinidos: React.Dispatch<React.SetStateAction<ValoresPredefinidos | null>>
) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

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

  return {
    saving,
    handleDeleteValue
  };
};
