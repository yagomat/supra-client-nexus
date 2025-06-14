
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
      
      console.log(`Tentando excluir valor: "${valueToDelete}" (tipo: ${typeof valueToDelete}) da aba: ${activeTab} (tipo singular: ${singularType})`);
      
      // Normalizar o valor para o formato do banco de dados
      let normalizedValue: string;
      try {
        normalizedValue = normalizeValueForDatabase(valueToDelete, singularType);
        console.log(`Valor normalizado para exclusão: "${normalizedValue}"`);
      } catch (error) {
        console.error("Erro ao normalizar valor para exclusão:", error);
        toast({
          title: "Erro na normalização",
          description: "Não foi possível normalizar o valor para exclusão.",
          variant: "destructive",
        });
        return false;
      }
      
      // Tentar excluir com o valor normalizado
      console.log(`Chamando deleteValorPredefinido com tipo: "${singularType}" e valor: "${normalizedValue}"`);
      let result = await deleteValorPredefinido(singularType, normalizedValue);
      let typedResult = result as unknown as ValorPredefinidoResponse;
      
      // Se não encontrou e é UF, tentar variações de caso
      if (!typedResult.success && singularType === 'uf') {
        const originalValue = String(valueToDelete);
        const variations = [
          originalValue.toLowerCase(),
          originalValue.toUpperCase(),
          originalValue.charAt(0).toUpperCase() + originalValue.slice(1).toLowerCase()
        ];
        
        console.log(`Valor UF não encontrado. Tentando variações: ${variations.join(', ')}`);
        
        for (const variation of variations) {
          if (variation !== normalizedValue) {
            console.log(`Tentando variação: "${variation}"`);
            result = await deleteValorPredefinido(singularType, variation);
            typedResult = result as unknown as ValorPredefinidoResponse;
            if (typedResult.success) {
              console.log(`Sucesso com variação: "${variation}"`);
              break;
            }
          }
        }
      }
      
      if (!typedResult.success) {
        console.error(`Erro na exclusão após todas as tentativas: ${typedResult.message}`);
        toast({
          title: "Erro ao excluir valor",
          description: typedResult.message || "Valor não encontrado no banco de dados.",
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
        
        console.log(`Valor removido do estado local. Array atualizado:`, newValues[tabKey]);
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
