
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ValoresPredefinidos } from "@/types";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";
import { sortValoresPredefinidos } from "@/services/valoresPredefinidosService/utils";

export const useValoresPredefinidosData = () => {
  const [loading, setLoading] = useState(true);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const { toast } = useToast();

  const fetchValoresPredefinidos = async () => {
    try {
      setLoading(true);
      const data = await getValoresPredefinidos();
      const valoresData = data as unknown as ValoresPredefinidos;
      
      // Garantir que os dados estejam sempre ordenados
      if (valoresData) {
        sortValoresPredefinidos(valoresData);
      }
      
      setValoresPredefinidos(valoresData);
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

  useEffect(() => {
    fetchValoresPredefinidos();
  }, []);  // Removido toast da dependência pois não muda

  return {
    loading,
    valoresPredefinidos,
    setValoresPredefinidos: (valores: ValoresPredefinidos | null) => {
      if (valores) {
        sortValoresPredefinidos(valores);
      }
      setValoresPredefinidos(valores);
    },
    refreshValoresPredefinidos: fetchValoresPredefinidos
  };
};
