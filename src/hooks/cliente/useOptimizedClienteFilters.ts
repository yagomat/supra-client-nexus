
import { useState, useEffect, useMemo } from "react";
import { Cliente, Pagamento } from "@/types";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { sortClientesByOrder } from "./clienteSortUtils";
import { supabase } from "@/integrations/supabase/client";
import { CryptoStorage } from "@/utils/cryptoStorage";
import { logError } from "@/utils/errorHandler";

type StatusFilterType = "todos" | "ativo" | "inativo";

export const useOptimizedClienteFilters = (clientes: Cliente[]) => {
  // Carregar configurações padrão do storage criptografado
  const getDefaultStatus = async (): Promise<StatusFilterType> => {
    try {
      const saved = await CryptoStorage.getItem<StatusFilterType>("defaultStatusFilter");
      return saved || "todos";
    } catch (error) {
      logError(error, 'getDefaultStatus');
      return "todos";
    }
  };

  const getDefaultOrder = async (): Promise<ClienteOrderType> => {
    try {
      const saved = await CryptoStorage.getItem<ClienteOrderType>("defaultOrderFilter");
      return saved || "data";
    } catch (error) {
      logError(error, 'getDefaultOrder');
      return "data";
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("todos");
  const [orderBy, setOrderBy] = useState<ClienteOrderType>("data");
  const [clientesPayments, setClientesPayments] = useState<Map<string, Pagamento[]>>(new Map());
  
  // Carregar configurações padrão na inicialização
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const defaultStatus = await getDefaultStatus();
        const defaultOrder = await getDefaultOrder();
        setStatusFilter(defaultStatus);
        setOrderBy(defaultOrder);
      } catch (error) {
        logError(error, 'loadDefaultFilters');
      }
    };
    
    loadDefaults();
  }, []);

  // Buscar pagamentos apenas quando necessário e com cache
  useEffect(() => {
    const fetchPaymentsForSorting = async () => {
      if (orderBy !== 'vencimento' || clientes.length === 0) {
        return;
      }

      try {
        // Cache simples para evitar requests desnecessários
        const cacheKey = `payments_${clientes.map(c => c.id).sort().join('_')}`;
        const cachedPayments = sessionStorage.getItem(cacheKey);
        
        if (cachedPayments) {
          const parsedPayments = JSON.parse(cachedPayments);
          setClientesPayments(new Map(parsedPayments));
          return;
        }

        const clienteIds = clientes.map(c => c.id);
        const { data, error } = await supabase
          .from('pagamentos')
          .select('*')
          .in('cliente_id', clienteIds)
          .order('ano', { ascending: false })
          .order('mes', { ascending: false });

        if (error) {
          logError(error, "fetchPaymentsForSorting");
          return;
        }

        const paymentsMap = new Map<string, Pagamento[]>();
        data?.forEach(payment => {
          const clienteId = payment.cliente_id;
          if (!paymentsMap.has(clienteId)) {
            paymentsMap.set(clienteId, []);
          }
          paymentsMap.get(clienteId)!.push(payment);
        });

        setClientesPayments(paymentsMap);
        
        // Cache por 5 minutos
        sessionStorage.setItem(cacheKey, JSON.stringify(Array.from(paymentsMap.entries())));
        setTimeout(() => sessionStorage.removeItem(cacheKey), 5 * 60 * 1000);
        
      } catch (error) {
        logError(error, "fetchPaymentsForSorting");
      }
    };

    fetchPaymentsForSorting();
  }, [clientes, orderBy]);

  // Filtrar e ordenar clientes localmente
  const filteredClientes = useMemo(() => {
    console.log("🔍 Filtros aplicados:", { 
      totalClientes: clientes.length, 
      searchTerm, 
      statusFilter, 
      orderBy,
      uniqueIds: new Set(clientes.map(c => c.id)).size 
    });

    // Verificar se há IDs duplicados
    const ids = clientes.map(c => c.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.error("❌ IDs duplicados encontrados:", ids.filter((id, index) => ids.indexOf(id) !== index));
    }

    // Aplicar filtro de status localmente
    let filtered = clientes.filter(cliente => {
      if (statusFilter !== "todos" && cliente.status !== statusFilter) {
        return false;
      }
      return true;
    });

    console.log("📊 Após filtro de status:", filtered.length);

    // Aplicar filtro de busca localmente
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchLower) ||
        cliente.telefone?.toLowerCase().includes(searchLower) ||
        cliente.servidor.toLowerCase().includes(searchLower)
      );
      console.log("🔎 Após filtro de busca:", filtered.length);
    }

    // Aplicar ordenação
    filtered = sortClientesByOrder(filtered, orderBy, clientesPayments);

    console.log("✅ Resultado final dos filtros:", filtered.length);
    return filtered;
  }, [clientes, searchTerm, statusFilter, orderBy, clientesPayments]);

  const handleOrderChange = (newOrder: ClienteOrderType) => {
    setOrderBy(newOrder);
  };

  const handleLimparFiltros = async () => {
    setSearchTerm("");
    const defaultStatus = await getDefaultStatus();
    const defaultOrder = await getDefaultOrder();
    setStatusFilter(defaultStatus);
    setOrderBy(defaultOrder);
  };

  return {
    filteredClientes,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    orderBy,
    handleOrderChange,
    handleLimparFiltros
  };
};
