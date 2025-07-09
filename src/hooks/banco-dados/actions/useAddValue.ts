
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ValoresPredefinidos } from "@/types";
import { ValorPredefinidoResponse } from "@/types/supabase-responses";
import { addValorPredefinido } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";
import { convertToSingularType } from "@/services/valoresPredefinidosService/utils";
import { validateMultipleValuesEnhanced } from "../utils/enhancedValidations";
import { normalizeValueForDatabase } from "../utils/valueNormalization";
import { generateValuePreview } from "../utils/multipleValueUtils";

export const useAddValue = (
  valoresPredefinidos: ValoresPredefinidos | null,
  setValoresPredefinidos: React.Dispatch<React.SetStateAction<ValoresPredefinidos | null>>,
  refreshValoresPredefinidos: () => Promise<void>
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

      // Usar validação aprimorada
      const validationResult = validateMultipleValuesEnhanced(newValueOrNumber, activeTab);
      
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
      let duplicateCount = 0;
      let errorCount = 0;
      const errors: string[] = [];
      const duplicateValues: (string | number)[] = [];

      for (const value of validationResult.values) {
        try {
          // Normalizar o valor antes de enviar para o banco
          const normalizedValue = normalizeValueForDatabase(value, singularType);
          console.log(`Adicionando valor normalizado: "${normalizedValue}" (original: "${value}") do tipo: ${singularType}`);
          
          const result = await addValorPredefinido(singularType, normalizedValue);
          const typedResult = result as unknown as ValorPredefinidoResponse;
          
          if (typedResult.success) {
            addedCount++;
          } else {
            // Verificar se é erro de rate limiting
            if (typedResult.message?.includes('Limite de')) {
              errorCount++;
              errors.push(`Rate limit: ${typedResult.message}`);
            } else if (typedResult.message === 'Valor já existe') {
              duplicateCount++;
              duplicateValues.push(value);
            } else {
              errorCount++;
              errors.push(`${value}: ${typedResult.message}`);
            }
          }
        } catch (error) {
          errorCount++;
          errors.push(`${value}: Erro ao adicionar`);
          console.error(`Erro ao adicionar valor ${value}:`, error);
        }
      }
      
      // Recarregar dados do servidor para manter ordenação correta
      if (addedCount > 0) {
        await refreshValoresPredefinidos();
        
        const addedPreview = generateValuePreview(validationResult.values.slice(0, addedCount));
        let message = "";
        
        if (validationResult.totalCount === 1) {
          message = "Valor adicionado com sucesso.";
        } else {
          message = `${addedCount} ${addedCount === 1 ? 'valor adicionado' : 'valores adicionados'} com sucesso: ${addedPreview}`;
        }
        
        toast({
          title: "Sucesso",
          description: message,
        });
      }
      
      // Feedback para valores duplicados
      if (duplicateCount > 0) {
        const duplicatePreview = generateValuePreview(duplicateValues);
        const message = duplicateCount === 1 
          ? `Valor "${duplicatePreview}" já existe e não foi adicionado.`
          : `${duplicateCount} valores já existem e não foram adicionados: ${duplicatePreview}`;
        
        toast({
          title: "Valores duplicados",
          description: message,
          variant: "destructive",
        });
      }
      
      // Feedback para outros erros
      if (errorCount > 0) {
        toast({
          title: "Alguns valores não foram adicionados",
          description: errors.join("; "),
          variant: "destructive",
        });
      }

      // Se nenhum valor foi adicionado (todos duplicados ou com erro)
      if (addedCount === 0 && (duplicateCount > 0 || errorCount > 0)) {
        return false;
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
