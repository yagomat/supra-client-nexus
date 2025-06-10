
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ValoresPredefinidos } from "@/types";
import { ValorPredefinidoResponse } from "@/types/supabase-responses";
import { addValorPredefinido } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";
import { convertToSingularType } from "@/services/valoresPredefinidosService/utils";

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
      
      // Validar se o valor não está vazio
      if (!newValueOrNumber || (typeof newValueOrNumber === 'string' && newValueOrNumber.trim() === '')) {
        toast({
          title: "Erro",
          description: "Por favor, insira um valor válido.",
          variant: "destructive",
        });
        return false;
      }

      // Converter tipo para formato singular
      const singularType = convertToSingularType(activeTab as keyof ValoresPredefinidos);
      
      const result = await addValorPredefinido(singularType, newValueOrNumber);
      const typedResult = result as unknown as ValorPredefinidoResponse;
      
      if (!typedResult.success) {
        toast({
          title: "Erro ao adicionar valor",
          description: typedResult.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Atualizar estado local imediatamente
      setValoresPredefinidos(prev => {
        if (!prev) return prev;
        
        const newValues = { ...prev };
        const tabKey = activeTab as keyof ValoresPredefinidos;
        
        // Adicionar o novo valor ao array correspondente
        if (tabKey === 'dias_vencimento') {
          const numericValue = Number(newValueOrNumber);
          newValues[tabKey] = [...newValues[tabKey], numericValue].sort((a, b) => Number(a) - Number(b));
        } else if (tabKey === 'valores_plano') {
          const numericValue = Number(newValueOrNumber);
          newValues[tabKey] = [...newValues[tabKey], numericValue].sort((a, b) => Number(a) - Number(b));
        } else {
          const stringValue = String(newValueOrNumber);
          (newValues[tabKey] as string[]) = [...(newValues[tabKey] as string[]), stringValue].sort();
        }
        
        return newValues;
      });
      
      toast({
        title: "Sucesso",
        description: "Valor adicionado com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao adicionar valor", error);
      toast({
        title: "Erro ao adicionar valor",
        description: "Ocorreu um erro ao adicionar o valor. Verifique sua conexão e tente novamente.",
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
