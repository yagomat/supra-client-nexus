
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";

export const useValoresPredefinidosData = () => {
  const [loading, setLoading] = useState(true);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
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

  return {
    loading,
    valoresPredefinidos,
    setValoresPredefinidos,
  };
};
