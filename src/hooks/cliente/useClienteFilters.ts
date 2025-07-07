
import { useState, useEffect, useMemo } from "react";
import { Cliente, Pagamento } from "@/types";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { sortClientesByOrder } from "./clienteSortUtils";
import { supabase } from "@/integrations/supabase/client";

export const useClienteFilters = (clientes: Cliente[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState<ClienteOrderType>('data');
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [clientesPayments, setClientesPayments] = useState<Map<string, Pagamento[]>>(new Map());

  // Buscar pagamentos de todos os clientes quando necessário para ordenação
  useEffect(() => {
    const fetchAllPayments = async () => {
      if (orderBy !== 'vencimento' || clientes.length === 0) {
        return;
      }

      try {
        const clienteIds = clientes.map(c => c.id);
        const { data, error } = await supabase
          .from('pagamentos')
          .select('*')
          .in('cliente_id', clienteIds)
          .order('ano', { ascending: false })
          .order('mes', { ascending: false });

        if (error) {
          console.error("Erro ao buscar pagamentos para ordenação:", error);
          return;
        }

        // Agrupar pagamentos por cliente
        const paymentsMap = new Map<string, Pagamento[]>();
        data?.forEach(payment => {
          const clienteId = payment.cliente_id;
          if (!paymentsMap.has(clienteId)) {
            paymentsMap.set(clienteId, []);
          }
          paymentsMap.get(clienteId)!.push(payment);
        });

        setClientesPayments(paymentsMap);
      } catch (error) {
        console.error("Erro ao buscar pagamentos para ordenação:", error);
      }
    };

    fetchAllPayments();
  }, [clientes, orderBy]);

  // Filtrar e ordenar clientes
  const processedClientes = useMemo(() => {
    // Primeiro filtrar por termo de busca
    let filtered = clientes.filter(cliente =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.servidor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Depois ordenar
    filtered = sortClientesByOrder(filtered, orderBy, clientesPayments);

    return filtered;
  }, [clientes, searchTerm, orderBy, clientesPayments]);

  // Atualizar filteredClientes quando processedClientes mudar
  useEffect(() => {
    setFilteredClientes(processedClientes);
  }, [processedClientes]);

  const handleOrderChange = (newOrder: ClienteOrderType) => {
    setOrderBy(newOrder);
  };

  const handleLimparFiltros = () => {
    setSearchTerm("");
    setOrderBy('data');
  };

  return {
    filteredClientes,
    searchTerm,
    setSearchTerm,
    orderBy,
    handleOrderChange,
    handleLimparFiltros,
    setFilteredClientes
  };
};
