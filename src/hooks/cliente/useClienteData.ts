
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { getCliente } from "@/services/clienteService";
import { getPagamentos } from "@/services/pagamentoService";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { Cliente, ValoresPredefinidos, Pagamento } from "@/types";

export const useClienteData = (clienteId: string | undefined) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [valoresPredefinidos, setValoresPredefinidos] = useState<ValoresPredefinidos | null>(null);
  const [clientePagamentos, setClientePagamentos] = useState<Pagamento[]>([]);
  const [originalVencimento, setOriginalVencimento] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      if (!clienteId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar dados do cliente
        const cliente = await getCliente(clienteId);
        setCliente(cliente);
        
        // Salvar o dia de vencimento original para comparação posterior
        setOriginalVencimento(cliente.dia_vencimento);
        
        // Buscar pagamentos do cliente para determinar o status
        const pagamentos = await getPagamentos(clienteId);
        setClientePagamentos(pagamentos);
        
        // Buscar valores predefinidos
        const predefinidos = await getValoresPredefinidos();
        setValoresPredefinidos(predefinidos);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do cliente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clienteId, toast]);

  return {
    loading,
    cliente,
    valoresPredefinidos,
    clientePagamentos,
    originalVencimento,
  };
};
