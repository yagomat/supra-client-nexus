
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
    console.log("=== INÍCIO fetchFilaCobranca (hook) ===");
    console.log("Estado inicial - loading:", loading);
    console.log("Mês e ano atuais:", { mesAtual, anoAtual });
    
    try {
      setLoading(true);
      console.log("Loading definido como true");
      
      console.log("Chamando getFilaCobranca do service...");
      const data = await getFilaCobranca(mesAtual, anoAtual);
      
      console.log("=== DADOS RECEBIDOS NO HOOK ===");
      console.log("Tipo dos dados:", typeof data);
      console.log("É array:", Array.isArray(data));
      console.log("Quantidade:", data.length);
      console.log("Dados completos:", data);
      
      setFilaCobranca(data);
      console.log("Estado filaCobranca atualizado");
      
    } catch (error) {
      console.error("=== ERRO NO fetchFilaCobranca (hook) ===");
      console.error("Erro completo:", error);
      console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
      
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar a fila de cobrança.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("=== FIM fetchFilaCobranca - loading definido como false ===");
    }
  };

  const handleRegistrarCobranca = async (clienteId: string, tipoAviso: string) => {
    console.log("=== INÍCIO handleRegistrarCobranca ===");
    console.log("Parâmetros:", { clienteId, tipoAviso, mesAtual, anoAtual });
    
    try {
      setSubmitting(true);
      
      await registrarCobranca(clienteId, tipoAviso, mesAtual, anoAtual);
      
      toast({
        title: "Cobrança registrada",
        description: `Aviso de ${tipoAviso.replace('_', ' ')} registrado com sucesso.`,
      });
      
      console.log("Recarregando fila após registro...");
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
    console.log("=== useEffect do useCobranca executado ===");
    console.log("Hook useCobranca inicializado");
    fetchFilaCobranca();
  }, []);

  console.log("=== RENDER useCobranca ===");
  console.log("Estado atual:", {
    filaCobrancaLength: filaCobranca.length,
    loading,
    submitting
  });

  return {
    filaCobranca,
    loading,
    submitting,
    handleRegistrarCobranca,
    reloadFila: fetchFilaCobranca
  };
};
