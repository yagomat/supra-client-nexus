
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ValoresPredefinidos } from "@/types";
import { ValorPredefinidoResponse } from "@/types/supabase-responses";
import { deleteValorPredefinido } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";
import { convertToSingularType } from "@/services/valoresPredefinidosService/utils";
import { normalizeValueForDatabase } from "../utils/valueNormalization";

export const useDeleteValue = (
  valoresPredefinidos: ValoresPredefinidos | null,
  setValoresPredefinidos: React.Dispatch<React.SetStateAction<ValoresPredefinidos | null>>
) => {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleDeleteValue = async (activeTab: string, valueToDelete: string | number) => {
    if (!valoresPredefinidos) return false;
    
    try {
      setSaving(true);
      
      // Converter tipo para formato singular
      const singularType = convertToSingularType(activeTab as keyof ValoresPredefinidos);
      
      // Normalizar o valor para o formato do banco de dados
      let normalizedValue: string;
      try {
        normalizedValue = normalizeValueForDatabase(valueToDelete, singularType);
        console.log(`Tentando excluir valor normalizado: "${normalizedValue}" (original: "${valueToDelete}") do tipo: ${singularType}`);
      } catch (error) {
        console.error("Erro ao normalizar valor para exclusão:", error);
        toast({
          title: "Erro na normalização",
          description: "Não foi possível normalizar o valor para exclusão.",
          variant: "destructive",
        });
        return false;
      }
      
      const result = await deleteValorPredefinido(singularType, normalizedValue);
      const typedResult = result as unknown as ValorPredefinidoResponse;
      
      if (!typedResult.success) {
        console.error(`Erro na exclusão: ${typedResult.message}`);
        toast({
          title: "Erro ao excluir valor",
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
        
        // Remover o valor do array correspondente
        if (tabKey === 'dias_vencimento' || tabKey === 'valores_plano') {
          newValues[tabKey] = (newValues[tabKey] as number[]).filter(v => v !== Number(valueToDelete));
        } else {
          (newValues[tabKey] as string[]) = (newValues[tabKey] as string[]).filter(v => v !== String(valueToDelete));
        }
        
        return newValues;
      });
      
      toast({
        title: "Sucesso",
        description: "Valor excluído com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir valor", error);
      toast({
        title: "Erro ao excluir valor",
        description: "Ocorreu um erro ao excluir o valor. Verifique sua conexão e tente novamente.",
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
