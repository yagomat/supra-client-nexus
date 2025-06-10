
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ValoresPredefinidos } from "@/types";
import { ValorPredefinidoResponse } from "@/types/supabase-responses";
import { addValorPredefinido, getValoresPredefinidosOrdered } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";

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

      const result = await addValorPredefinido(activeTab, newValueOrNumber);
      const typedResult = result as unknown as ValorPredefinidoResponse;
      
      if (!typedResult.success) {
        toast({
          title: "Erro ao adicionar valor",
          description: typedResult.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Buscar valores atualizados diretamente do servidor (já ordenados)
      const updatedValues = await getValoresPredefinidosOrdered(activeTab);
      
      // Atualizar estado local com os valores ordenados do servidor
      setValoresPredefinidos(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [activeTab]: updatedValues || [],
        };
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
