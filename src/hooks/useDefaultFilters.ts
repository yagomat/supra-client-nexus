
import { useState, useEffect } from "react";
import { ClienteOrderType } from "@/components/clientes/ClienteOrderSelector";
import { CryptoStorage } from "@/utils/cryptoStorage";
import { logError } from "@/utils/errorHandler";

type StatusFilterType = "todos" | "ativo" | "inativo";

export const useDefaultFilters = () => {
  const [defaultStatus, setDefaultStatus] = useState<StatusFilterType>("todos");
  const [defaultOrder, setDefaultOrder] = useState<ClienteOrderType>("data");

  // Carregar configurações do storage criptografado na inicialização
  useEffect(() => {
    const loadDefaults = async () => {
      try {
        const savedStatus = await CryptoStorage.getItem<StatusFilterType>("defaultStatusFilter");
        const savedOrder = await CryptoStorage.getItem<ClienteOrderType>("defaultOrderFilter");
        
        // Usar "todos" como padrão se não houver valor salvo
        setDefaultStatus(savedStatus || "todos");
        // Usar "data" como padrão se não houver valor salvo (que corresponde a "cadastro")
        setDefaultOrder(savedOrder || "data");
      } catch (error) {
        logError(error, 'loadDefaultFilters');
        // Em caso de erro, usar os padrões
        setDefaultStatus("todos");
        setDefaultOrder("data");
      }
    };
    
    loadDefaults();
  }, []);

  const getDefaultFilters = () => ({
    status: defaultStatus,
    order: defaultOrder
  });

  return {
    defaultStatus,
    defaultOrder,
    getDefaultFilters
  };
};
