import { useState, useCallback, useMemo, useEffect } from "react";
import { Cliente, StatusFilterType } from "@/types";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { sortClientesByOrder } from "./clienteSortUtils";
import { supabase } from "@/integrations/supabase/client";
import { CryptoStorage } from "@/utils/cryptoStorage";
import { logError } from "@/utils/errorHandler";
import { logger } from "@/utils/logger";

export const useOptimizedClienteFilters = (clientes: Cliente[]) => {
  // Estado para filtros com recuperação de cache
  const getDefaultStatus = (): StatusFilterType => {
    try {
      const saved = CryptoStorage.getItem("defaultStatusFilter") as StatusFilterType;
      return saved || "todos";
    } catch {
      return "todos";
    }
  };

  const getDefaultOrder = (): ClienteOrderType => {
    try {
      const saved = sessionStorage.getItem("clienteOrder");
      return (saved as ClienteOrderType) || "nome_desc";
    } catch {
      return "nome_desc";
    }
  };

  // Estados dos filtros
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>(getDefaultStatus);
  const [orderBy, setOrderBy] = useState<ClienteOrderType>(getDefaultOrder);

  // Salvar orderBy no sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem("clienteOrder", orderBy);
    } catch (error) {
      logError(error, "Erro ao salvar orderBy no sessionStorage");
    }
  }, [orderBy]);

  // Otimização com cache em sessionStorage para listas grandes
  const cacheKey = useMemo(() => {
    return `filteredClientes_${clientes.length}_${searchTerm}_${statusFilter}_${orderBy}`;
  }, [clientes.length, searchTerm, statusFilter, orderBy]);

  // Filtrar e ordenar clientes
  const filteredClientes = useMemo(() => {
    // Tentar buscar do cache primeiro
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const cachedData = JSON.parse(cached);
        // Verificar se o cache ainda é válido comparando os IDs
        const cachedIds = cachedData.map((c: Cliente) => c.id).sort();
        const currentIds = clientes.map(c => c.id).sort();
        
        if (JSON.stringify(cachedIds) === JSON.stringify(currentIds)) {
          return cachedData;
        }
      }
    } catch (error) {
      // Cache inválido ou erro de parsing - continuar com processamento normal
      console.warn("Cache inválido, reprocessando filtros:", error);
    }

    if (!clientes || clientes.length === 0) {
      return [];
    }

    // Garantir que não há duplicatas (deduplicação por ID)
    const uniqueClientes = clientes.filter((cliente, index, array) => 
      array.findIndex(c => c.id === cliente.id) === index
    );

    logger.filter("Filtros aplicados", { 
      totalClientes: clientes.length,
      searchTerm,
      statusFilter,
      orderBy,
      uniqueIds: new Set(clientes.map(c => c.id)).size
    });

    let filtered = [...uniqueClientes];

    // Aplicar filtro de status
    if (statusFilter !== "todos") {
      filtered = filtered.filter(cliente => cliente.status === statusFilter);
    }

    logger.filter("Após filtro de status", { count: filtered.length });

    // Aplicar filtro de pesquisa
    if (searchTerm.trim()) {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(cliente => 
        cliente.nome?.toLowerCase().includes(normalizedSearch) ||
        cliente.telefone?.toLowerCase().includes(normalizedSearch) ||
        cliente.servidor?.toLowerCase().includes(normalizedSearch) ||
        cliente.uf?.toLowerCase().includes(normalizedSearch) ||
        cliente.aplicativo?.toLowerCase().includes(normalizedSearch)
      );
      logger.filter("Após filtro de busca", { count: filtered.length });
    }

    // Aplicar ordenação
    filtered = sortClientesByOrder(filtered, orderBy);
    
    logger.filter("Resultado final dos filtros", { count: filtered.length });

    // Salvar no cache se a lista não estiver vazia
    if (filtered.length > 0) {
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(filtered));
      } catch (error) {
        // Cache cheio ou erro - limpar cache antigo
        sessionStorage.clear();
      }
    }

    return filtered;
  }, [clientes, searchTerm, statusFilter, orderBy, cacheKey]);

  const handleOrderChange = useCallback((newOrder: ClienteOrderType) => {
    setOrderBy(newOrder);
  }, []);

  const handleLimparFiltros = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("todos");
    setOrderBy("nome_desc");
    
    // Limpar cache relacionado a filtros
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith("filteredClientes_")) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      logError(error, "Erro ao limpar cache de filtros");
    }
  }, []);

  // Configurar listener para mudanças em tempo real nos pagamentos
  useEffect(() => {
    const paymentsChannel = supabase
      .channel('payments-filter-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pagamentos'
      }, () => {
        // Limpar cache quando houver mudanças nos pagamentos
        try {
          const keys = Object.keys(sessionStorage);
          keys.forEach(key => {
            if (key.startsWith("filteredClientes_")) {
              sessionStorage.removeItem(key);
            }
          });
        } catch (error) {
          logError(error, "Erro ao limpar cache após mudança de pagamentos");
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsChannel);
    };
  }, []);

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