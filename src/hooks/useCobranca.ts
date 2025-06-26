
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getFilaCobranca, registrarCobranca, FilaCobranca } from "@/services/cobrancaService";

export const useCobranca = () => {
  const [filaCobranca, setFilaCobranca] = useState<FilaCobranca[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const fetchFilaCobranca = async () => {
    try {
      setLoading(true);
      console.log("Carregando fila de cobrança...");
      const data = await getFilaCobranca(mesAtual, anoAtual);
      console.log("Dados recebidos:", data);
      setFilaCobranca(data);
      
    } catch (error) {
      console.error("Erro ao carregar fila de cobrança:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a fila de cobrança. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
      // Set empty array on error to avoid showing loading forever
      setFilaCobranca([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarCobranca = async (clienteId: string, tipoAviso: string) => {
    try {
      setSubmitting(true);
      
      await registrarCobranca(clienteId, tipoAviso, mesAtual, anoAtual);
      
      toast({
        title: "Cobrança registrada",
        description: `Aviso de ${tipoAviso.replace('_', ' ')} registrado com sucesso.`,
      });
      
      await fetchFilaCobranca();
      
    } catch (error) {
      console.error("Erro ao registrar cobrança:", error);
      toast({
        title: "Erro ao registrar cobrança",
        description: "Não foi possível registrar a cobrança.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchFilaCobranca();
  }, []);

  return {
    filaCobranca,
    loading,
    submitting,
    handleRegistrarCobranca,
    reloadFila: fetchFilaCobranca
  };
};
