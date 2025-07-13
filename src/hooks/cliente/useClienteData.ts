
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useParams } from "react-router-dom";
import { Cliente, Pagamento } from "@/types";
import { SecureClienteService } from "@/services/secureClienteService";
import { getPagamentos } from "@/services/pagamentoService";
import { getValoresPredefinidos } from "@/services/valoresPredefinidosService";
import { ValoresPredefinidos } from "@/types";
import { secureLog } from "@/utils/secureLogger";

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
    let isMounted = true;
    
    const fetchClienteData = async () => {
      if (!id) {
        if (isMounted) setLoading(false);
        return;
      }
      
      try {
        if (isMounted) setLoading(true);
        
        secureLog.clientOperation('fetch_cliente_data_start', { cliente_id: id });
        
        // Promise.all for parallel fetching
        const [predefinidos, clienteData] = await Promise.all([
          getValoresPredefinidos(),
          SecureClienteService.getClienteWithDecryptedData(id)
        ]);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setValoresPredefinidos(predefinidos);
          setCliente(clienteData);
          
          secureLog.clientOperation('cliente_data_loaded', { cliente_id: id });
          
          // Buscar pagamentos relacionados a este cliente
          const pagamentosData = await getPagamentos(id);
          if (isMounted) {
            setPagamentos(pagamentosData);
          }
        }
      } catch (error) {
        secureLog.error("Erro ao buscar dados do cliente", { 
          cliente_id: id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        if (isMounted) {
          toast({
            title: "Erro ao carregar cliente",
            description: "Não foi possível carregar os dados do cliente. Tentando novamente...",
            variant: "destructive",
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClienteData();
    
    // Cleanup function to prevent updating state after unmounting
    return () => {
      isMounted = false;
    };
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
