
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ValoresPredefinidos } from "@/types";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService/valoresPredefinidosActions";

export const useValoresPredefinidosData = () => {
  const [loading, setLoading] = useState(true);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const { toast } = useToast();

  const fetchValoresPredefinidos = async () => {
    try {
      setLoading(true);
      const data = await getValoresPredefinidos();
      setValoresPredefinidos(data as unknown as ValoresPredefinidos);
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
    setValoresPredefinidos,
    refreshValoresPredefinidos: fetchValoresPredefinidos
  };
};
