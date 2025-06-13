
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ValoresPredefinidos } from "@/types";
import { ValorPredefinidoResponse } from "@/types/supabase-responses";
import { addValorPredefinido } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";
import { convertToSingularType } from "@/services/valoresPredefinidosService/utils";
import { validateMultipleValues, generateValuePreview } from "../utils/multipleValueUtils";

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

      // Validar múltiplos valores
      const validationResult = validateMultipleValues(newValueOrNumber, activeTab);
      
      if (!validationResult.isValid) {
        toast({
          title: "Erro ao validar valores",
          description: validationResult.errors.join("; "),
          variant: "destructive",
        });
        return false;
      }

      // Converter tipo para formato singular
      const singularType = convertToSingularType(activeTab as keyof ValoresPredefinidos);
      
      // Adicionar cada valor individualmente
      let addedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const value of validationResult.values) {
        try {
          const result = await addValorPredefinido(singularType, value);
          const typedResult = result as unknown as ValorPredefinidoResponse;
          
          if (typedResult.success) {
            addedCount++;
            
            // Atualizar estado local imediatamente
            setValoresPredefinidos(prev => {
              if (!prev) return prev;
              
              const newValues = { ...prev };
              const tabKey = activeTab as keyof ValoresPredefinidos;
              
              // Adicionar o novo valor ao array correspondente
              if (tabKey === 'dias_vencimento') {
                const numericValue = Number(value);
                if (!newValues[tabKey].includes(numericValue)) {
                  newValues[tabKey] = [...newValues[tabKey], numericValue].sort((a, b) => Number(a) - Number(b));
                }
              } else if (tabKey === 'valores_plano') {
                const numericValue = Number(value);
                if (!newValues[tabKey].includes(numericValue)) {
                  newValues[tabKey] = [...newValues[tabKey], numericValue].sort((a, b) => Number(a) - Number(b));
                }
              } else {
                const stringValue = String(value);
                const currentArray = newValues[tabKey] as string[];
                if (!currentArray.includes(stringValue)) {
                  (newValues[tabKey] as string[]) = [...currentArray, stringValue].sort();
                }
              }
              
              return newValues;
            });
          } else {
            if (typedResult.message !== 'Valor já existe') {
              errorCount++;
              errors.push(`${value}: ${typedResult.message}`);
            }
          }
        } catch (error) {
          errorCount++;
          errors.push(`${value}: Erro ao adicionar`);
        }
      }
      
      // Feedback para o usuário
      if (addedCount > 0) {
        const preview = generateValuePreview(validationResult.values.slice(0, addedCount));
        let message = "";
        
        if (validationResult.totalCount === 1) {
          message = "Valor adicionado com sucesso.";
        } else if (addedCount === validationResult.validCount) {
          message = `${addedCount} valores adicionados com sucesso: ${preview}`;
        } else {
          message = `${addedCount} de ${validationResult.validCount} valores adicionados: ${preview}`;
        }
        
        toast({
          title: "Sucesso",
          description: message,
        });
      }
      
      if (errorCount > 0 && validationResult.errors.length === 0) {
        toast({
          title: "Alguns valores não foram adicionados",
          description: errors.join("; "),
          variant: "destructive",
        });
      }
      
      return addedCount > 0;
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
