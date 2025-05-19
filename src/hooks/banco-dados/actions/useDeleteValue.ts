
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ValoresPredefinidos } from "@/types";
import { ValorPredefinidoResponse } from "@/types/supabase-responses";
import { deleteValorPredefinido } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";

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
      
      const result = await deleteValorPredefinido(type, value);
      const typedResult = result as unknown as ValorPredefinidoResponse;
      
      if (!typedResult.success) {
        toast({
          title: "Erro ao excluir valor",
          description: typedResult.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Atualizar estado local após sucesso
      const currentValues = valoresPredefinidos[type as keyof ValoresPredefinidos];
      const updatedValues = (currentValues as any[]).filter(item => item !== value);
      
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
