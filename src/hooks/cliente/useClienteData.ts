
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { Cliente, Pagamento } from "@/types";
import { getCliente } from "@/services/clienteService";
import { getPagamentos } from "@/services/pagamentoService";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";

export const useClienteData = () => {
  const { id } = useParams<{ id: string }>();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const { toast } = useToast();

  // Armazenar o dia de vencimento original para comparações
  const originalVencimento = cliente?.dia_vencimento || 0;

  useEffect(() => {
    const fetchClienteData = async () => {
      try {
        setLoading(true);
        
        // Buscar predefinições
        const predefinidos = await getValoresPredefinidos();
        setValoresPredefinidos(predefinidos);
        
        // Buscar dados do cliente
        if (id) {
          const clienteData = await getCliente(id);
          setCliente(clienteData);
          
          // Buscar pagamentos relacionados a este cliente
          const pagamentosData = await getPagamentos(id);
          setPagamentos(pagamentosData);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do cliente:", error);
        toast({
          title: "Erro ao carregar cliente",
          description: "Não foi possível carregar os dados do cliente. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClienteData();
  }, [id, toast]);

  return {
    cliente,
    setCliente,
    pagamentos,
    setPagamentos,
    loading,
    clienteId: id,
    valoresPredefinidos,
    clientePagamentos: pagamentos, // Alias para compatibilidade
    originalVencimento
  };
};
