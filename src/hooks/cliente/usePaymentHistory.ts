
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pagamento } from "@/types";

export const usePaymentHistory = (clienteId: string) => {
  const [payments, setPayments] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('ano', { ascending: false })
        .order('mes', { ascending: false });

      if (error) {
        console.error("Erro ao buscar histórico de pagamentos:", error);
        return;
      }

      console.log(`Payments fetched for ${clienteId}:`, data);
      setPayments([...(data || [])]);
    } catch (error) {
      console.error("Erro ao buscar histórico de pagamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clienteId) return;

    fetchPayments();

    // Configurar listener em tempo real para todos os pagamentos do cliente
    const channel = supabase
      .channel(`pagamentos-history-${clienteId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pagamentos',
          filter: `cliente_id=eq.${clienteId}`
        }, 
        (payload) => {
          console.log('Payment history change detected:', payload);
          
          // Atualizar o estado local de forma otimizada
          if (payload.eventType === 'INSERT') {
            setPayments(prev => {
              const newPayment = payload.new as Pagamento;
              // Verificar se o pagamento já existe para evitar duplicatas
              const exists = prev.some(p => p.id === newPayment.id);
              if (!exists) {
                return [...prev, newPayment];
              }
              return prev;
            });
          } else if (payload.eventType === 'UPDATE') {
            setPayments(prev => prev.map(p => 
              p.id === payload.new.id ? payload.new as Pagamento : p
            ));
          } else if (payload.eventType === 'DELETE') {
            setPayments(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clienteId]);

  return { payments, loading, refetch: fetchPayments };
};
