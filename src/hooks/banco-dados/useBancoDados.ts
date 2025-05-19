
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getValoresPredefinidos, updateValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";

export const useBancoDados = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const [activeTab, setActiveTab] = useState("ufs");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: string; value: string | number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchValoresPredefinidos = async () => {
      try {
        setLoading(true);
        const data = await getValoresPredefinidos();
        setValoresPredefinidos(data);
      } catch (error) {
        console.error("Erro ao buscar valores predefinidos", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os valores predefinidos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchValoresPredefinidos();
  }, [toast]);

  const handleAddValue = async (newValueOrNumber: string | number) => {
    if (!valoresPredefinidos) return;
    
    try {
      setSaving(true);
      
      const isNumeric = ["dias_vencimento"].includes(activeTab);
      const isPlano = activeTab === "valores_plano";
      
      let updatedValues: (string | number)[] = [];
      const currentValues = valoresPredefinidos[activeTab as keyof ValoresPredefinidos];
      
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
        
        updatedValues = [...currentValues as number[], newValueOrNumber];
      } else {
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
        } else if (isPlano && newValueOrNumber.length > 4) {
          toast({
            title: "Valor inválido",
            description: "O valor do plano deve ter no máximo 4 caracteres.",
            variant: "destructive",
          });
          return;
        }
        
        updatedValues = [...currentValues as string[], newValueOrNumber];
      }
      
      // Remove duplicates and sort
      if (isNumeric) {
        updatedValues = Array.from(new Set(updatedValues as number[]));
        updatedValues = (updatedValues as number[]).sort((a, b) => a - b);
      } else {
        updatedValues = Array.from(new Set(updatedValues as string[]));
        updatedValues = (updatedValues as string[]).sort();
      }
      
      // Update backend
      await updateValoresPredefinidos(activeTab as keyof ValoresPredefinidos, updatedValues);
      
      // Update local state
      setValoresPredefinidos({
        ...valoresPredefinidos,
        [activeTab]: updatedValues,
      });
      
      // Close dialog
      setIsAddDialogOpen(false);
      
      toast({
        title: "Valor adicionado",
        description: "O valor foi adicionado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao adicionar valor", error);
      toast({
        title: "Erro ao adicionar valor",
        description: "Ocorreu um erro ao adicionar o valor. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteValue = async () => {
    if (!valoresPredefinidos || !itemToDelete) return;
    
    try {
      setSaving(true);
      
      const { type, value } = itemToDelete;
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
    } catch (error) {
      console.error("Erro ao excluir valor", error);
      toast({
        title: "Erro ao excluir valor",
        description: "Ocorreu um erro ao excluir o valor. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setItemToDelete(null);
    }
  };

  const handleImport = async (importText: string) => {
    try {
      setSaving(true);
      
      let values: (string | number)[] = [];
      const isNumeric = ["dias_vencimento"].includes(activeTab);
      const isPlano = activeTab === "valores_plano";
      
      // Process imported text
      const items = importText.split("\n").map((item) => item.trim()).filter((item) => item.length > 0);
      
      if (isNumeric) {
        values = items.map((item) => {
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
      } else {
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
        values = items;
      }
      
      // Remove duplicates
      if (isNumeric) {
        values = Array.from(new Set(values as number[]));
        values = (values as number[]).sort((a, b) => a - b);
      } else {
        values = Array.from(new Set(values as string[]));
        values = (values as string[]).sort();
      }
      
      // Update backend
      await updateValoresPredefinidos(activeTab as keyof ValoresPredefinidos, values);
      
      // Update local state
      setValoresPredefinidos({
        ...valoresPredefinidos!,
        [activeTab]: values,
      });
      
      // Close dialog
      setIsImportDialogOpen(false);
      
      toast({
        title: "Importação concluída",
        description: `Foram importados ${values.length} valores com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao importar valores", error);
      toast({
        title: "Erro ao importar valores",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao importar os valores. Verifique se o formato está correto.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
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
    loading,
    saving,
    valoresPredefinidos,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    itemToDelete,
    setItemToDelete,
    handleAddValue,
    handleDeleteValue,
    handleImport,
    handleExport,
  };
};
